//rm *.png
//node --env-file .env script.js
const chromium = require('playwright');
const auth = require('./index.js')
const {google} = require('googleapis');

let secs = 4
let intervalId;
let intervalTime = 1000*60*4; // Initial interval time in milliseconds


// Function to update the interval time
function updateIntervalTime(newTime) {
  clearInterval(intervalId); // Clear the existing interval
  intervalTime = 1000*60*newTime; // Update the interval time
  intervalId = setInterval(readStuff, intervalTime); // Set a new interval
}

function currentDate(){
  let offset = -300; //Timezone offset for EST in minutes.
  let dt = new Date();
  dt.setTime(dt.getTime() + dt.getTimezoneOffset()*60*1000);
  let estDate = new Date(dt.getTime() + offset*60*1000);
  
  let hours = estDate.getHours() + 1    
  let ampm = hours >= 12 ? 'pm' : 'am';
  hours = hours % 12;    
  hours = hours ? hours : 12;
  
  let minutes = String(estDate.getMinutes()).padStart(2, '0');
  let seconds = String(estDate.getSeconds()).padStart(2, '0');
  // console.log(`Current time: ${hours}:${minutes}:${seconds}`);
  let year = String(estDate.getFullYear())
  let month = String(estDate.getMonth() + 1).padStart(2, '0'); // Month is 0-indexed
  let day = String(estDate.getDate()).padStart(2, '0');    

  return `${hours}:${minutes}:${seconds} ${ampm}`
  return `${month}/${day}/${year} ${hours}:${minutes}:${seconds} ${ampm}`
}

function arraysEqual(a, b) {
  if (a === b) return true;
  if (a == null || b == null) return false;
  if (a.length !== b.length) return false;

  for (var i = 0; i < a.length; ++i) {
    if (a[i][0] !== b[i][0]) return false;
  }
  return true;
}

const getSlack = async() => {
    const browser = await chromium.chromium.launch();
    const context = await browser.newContext({storageState: 'playwright2/.auth2.json'})
    const page = await context.newPage();    
    let temp2 = []

    try{
      await page.goto(`${process.env.SLACK}`);
      console.log(page.url())
      await new Promise(resolve => setTimeout(resolve, 500));
      //await page.screenshot({ path: 'images/slack.png' });
    
      await page.locator('div.tabbed_channel__Abx5r').first().hover()
      //New messages above button
      try{
        await page.locator('button.c-button-unstyled.p-message_pane__unread_banner__close_icon').click({ timeout: 2000 })
      }
      catch{}

      try{
        await page.locator('button.c-message_list__day_divider__label__pill', {hasText: "Today"}).click({ timeout: 2000 })
      }
      catch{
        await page.locator('button.c-message_list__day_divider__label__pill', {hasText: "Yesterday"}).click()
      }
      await page.locator('button.c-menu_item__button', { hasText: "Yesterday" }).click()
      await page.mouse.wheel(0,450)
      await new Promise(resolve => setTimeout(resolve, 500));
      await page.mouse.wheel(0,450)
      await new Promise(resolve => setTimeout(resolve, 500));

      //Slack message contents
      let temp = await page.locator('div.p-rich_text_section').allInnerTexts()
      temp = temp.map( a =>  a.split('\n').filter(b => b.includes('#') ).map(c => c.replaceAll('#','')) )

      temp = temp.map(a => (a[0].replaceAll(' ','').includes('-') && !a[0].replaceAll(' ','').includes('RS')) ? [a[0].split('-')[0].replaceAll(' ','')] : a )
      temp.map(a => temp2.push(a))

      let temp4 = []
      while(true){

        await page.mouse.wheel(0,1200)
        await new Promise(resolve => setTimeout(resolve, 500));

        let temp3 = await page.locator('div.p-rich_text_section').allInnerTexts()
        temp3 = temp3.map( a =>  a.split('\n').filter(b => b.includes('#') ).map(c => c.replaceAll('#','')) )
        temp3 = temp3.map(a => (a[0].replaceAll(' ','').includes('-') && !a[0].replaceAll(' ','').includes('RS')) ? [a[0].split('-')[0].replaceAll(' ','')] : a )
        //temp3 = temp3.map(a => a[0].replaceAll(' ','').includes('-') ? [a[0].split('-')[0].replaceAll(' ','')] : a )
        
        if (arraysEqual(temp,temp3)) break
        if (arraysEqual(temp3,temp4)) break

        temp3.map(a => temp2.push(a))
        temp4 = temp3
      }
      
      //console.log(temp2)
      //console.log([...new Set(temp2.map(a => a[0]))])
    }
    catch{
        // await page.screenshot({ path: 'images/error.png' })
        // console.error(`Error message: ${e}`)
    }
    await context.close();
    await browser.close(); 
    let set = [...new Set(temp2.map(a => a[0]))]  
    return (set.map(a => [a]))
    //return temp2 
}
const getIMS = async(orderNum) => {
  const browser = await chromium.webkit.launch();
    const context = await browser.newContext({storageState: 'playwright2/.auth.json'})
    const page = await context.newPage();
    let data = []    

    try{
        //let orderNum = ['EB2311','LE1723','EB2400']
        await page.goto(`${process.env.LOGIN}`);               
        //console.log(page.url())        
        if (page.url() === `${process.env.LOGIN}/login`){
          console.log('Need to login first')
          //await page.screenshot({ path: `temp.png` });
          await page.locator('input#email').fill(process.env.username)
          await page.locator('input#password').fill(process.env.pw)
          await page.getByRole('button', {name: /Login/}).click()            
        
          await context.storageState({ path: 'playwright/.auth.json' })
        }
        //download ims csv
        // const [ download ] = await Promise.all([
        //   page.waitForEvent('download'),
        //   page.goto(`${process.env.LOGIN}/items/list`),          
        //   page.getByTitle('Export All Items').click()
        // ]);
        // await download.saveAs('ims.csv');       
        
        console.log('Running...')

        for (let i = 0; i < orderNum.length; i++){           
            let gb = ''
            let inbound = ''
            await page.goto(`${process.env.EDIT}${orderNum[i]}`);       
            
            await page.locator('table#totalGbAmount').waitFor()      
            gb = await page.locator('div.total_gb_amount input').inputValue()   
            
            let select = "input[name='inboundDate']"
            inbound = await page.locator(select).inputValue()
            //console.log(inbound)
                     
            await page.locator('table#orderDetail').waitFor()                                    

            let rowHeaders = page.locator('table#orderDetail')            
            //Filter Method
            let tableRows = await rowHeaders.locator('tr').filter( {hasText: /(ipad|iphone|mcc|hotspot)/i} ).filter( {hasNotText: 'for'} ).allInnerTexts()                       
            data.push([inbound,`=HYPERLINK("${process.env.EDIT}${orderNum[i]}","${orderNum[i]}")`,currentDate(),`Total GB: ${gb}`])            
            tableRows.map(a => {
                let tempRow = a.split('\t')  
                tempRow.unshift('')               
                //data.push( tempRow.slice(0,tempRow.length - 1)) 
                data.push(tempRow)
            })
            data.push(['','','','',''])             
            //Screenshot of just table    
            //await rowHeaders.screenshot({ path: `images/${orderNum[i]}table.png` })            
            //console.log(orderNum[i])
        }
        secs === 1 ? updateIntervalTime(4) : null
        secs = 4
    }
    catch(e){
        // await page.screenshot({ path: 'images/error.png' })
        secs === 4 ? updateIntervalTime(1) : null
        secs = 1
        console.error(`Error message: ${e}`)
    }
    await context.close();
    await browser.close();
    return data
}
async function googleSheets(temp) {  
  // console.log(data)
  let indexes = []
  
  let authorized = await auth.authorize()
  const sheets = google.sheets({version: 'v4', auth: authorized});
  // let vals = [[1],[2],[3],[4],[5]]

  try{
    //Get last cell indexes
    let res = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.spreadsheetId,
      range: 'Overage Format2!Q1:Q3',
    });
    let rows = res.data.values;
    if (!rows || rows.length === 0) {
      console.log('No data found.');
      return;
    }  
    //Clear orders read from slack
    rows.map(a => indexes.push(a[0]))
    if (indexes[0] > 1)
      res = await sheets.spreadsheets.values.clear({
        spreadsheetId: process.env.spreadsheetId,
        range: `Overage Format2!J2:J${indexes[0]}`,
      })

 
    
    //Update orders read from slack  
    let res2 = await sheets.spreadsheets.values.update({
      spreadsheetId: process.env.spreadsheetId,
      range: `Overage Format2!J2:J${temp.length + 1}`,
      valueInputOption: 'USER_ENTERED', //or 'RAW'
      resource:{
        //majorDimension: 'COLUMNS',
        values: temp
      }
    });

    console.log(`Updated Orders Total: ${res2.data.updatedRows}`)
    //Clear order data read from ims
    if (indexes[1] > 2)
      res = await sheets.spreadsheets.values.clear({
        spreadsheetId: process.env.spreadsheetId,
        range: `Overage Format2!L3:P${indexes[1]}`,
    })

    let data2 = []
    //Get manual orders to look up in ims
    if (indexes[2] > 1){
      res = await sheets.spreadsheets.values.get({
        spreadsheetId: process.env.spreadsheetId,
        range: `Overage Format2!I2:I${indexes[2]}`,
      })
      rows = res.data.values
      rows.filter(a => a[0] !== undefined).map(a => data2.push(a[0]))       
    }
    temp.map(a => data2.push(a[0]))
    //console.log(data2)
    const data = await getIMS(data2)     
    
    //Update order info on overage sheet
    res2 = await sheets.spreadsheets.values.update({
      spreadsheetId: process.env.spreadsheetId,
      range: `Overage Format2!L3:P${data.length + 2}`,
      valueInputOption: 'USER_ENTERED', //or 'RAW'
      resource:{
        //majorDimension: 'COLUMNS',
        values: data
      }
    });

    console.log(`Updated Data Total: ${res2.data.updatedRows}`)
    //console.log(secs)
    console.log(currentDate() + '\n')
  }
  catch(e){
    console.error(e)
  }
    
}

const readStuff = async () => {
  let data = await getSlack()
  await googleSheets(data)    
}
readStuff()

// Set the initial interval
//intervalId = setInterval(readStuff, intervalTime);


// setInterval(()=>{
//   let offset = -300; //Timezone offset for EST in minutes.
//   let dt = new Date();
//   dt.setTime(dt.getTime() + dt.getTimezoneOffset()*60*1000);
//   let estDate = new Date(dt.getTime() + offset*60*1000);
    
//   let hours = estDate.getHours() + 1

//   if (hours >= 9 && hours <= 17)
//     readStuff()
// },1000*60*secs)