//node --env-file .env script.js
const chromium = require('playwright');
const auth = require('./google.js')
const {google} = require('googleapis');


let email = process.env.username;
let pw = process.env.pw;

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

    return `${month}/${day}/${year} ${hours}:${minutes}:${seconds} ${ampm}`
}

const getStuff2 = async(orderNum) => {
  const browser = await chromium.chromium.launch();
    const context = await browser.newContext({storageState: 'playwright/.auth.json'})
    const page = await context.newPage();
    let data = []    

    try{
        //let orderNum = ['EB2311','LE1723','EB2400']
        await page.goto(`${process.env.LOGIN}`);               
        console.log(page.url())        
        if (page.url() === `${process.env.LOGIN}/login`){
          console.log('Need to login first')
          //await page.screenshot({ path: `temp.png` });
          await page.locator('input#email').fill(email)
          await page.locator('input#password').fill(pw)
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
        
        

        for (let i = 0; i < orderNum.length; i++){           
            let gb = ''
            await page.goto(`${process.env.EDIT}${orderNum[i]}`);            
            await page.locator('table#totalGbAmount').waitFor()      
            gb = await page.locator('div.total_gb_amount input').inputValue()            

            //await page.goto(`${process.env.CHECKIN}${orderNum[i]}`);        

            // await page.waitForLoadState('load');                      
            // await page.locator('form#checkoutOrderFrm').waitFor()
            await page.locator('table#orderDetail').waitFor()               
            // await page.waitForSelector('div.loading-spinner', { state: 'hidden' })
            // await new Promise(resolve => setTimeout(resolve, 500));
            // await page.screenshot({ path: `images/${orderNum[i]}.png` });                      

            let rowHeaders = page.locator('table#orderDetail')            
            //Filter Method
            let tableRows = await rowHeaders.locator('tr').filter( {hasText: /(ipad|iphone|mcc|hotspot)/i} ).filter( {hasNotText: 'for'} ).allInnerTexts()                       
            data.push([`=HYPERLINK("${process.env.EDIT}${orderNum[i]}","${orderNum[i]}")`,currentDate(),`Total GB: ${gb}`])            
            tableRows.map(a => {
                let tempRow = a.split('\t')                 
                //data.push( tempRow.slice(0,tempRow.length - 1)) 
                data.push(tempRow)
            })
            data.push(['','','',''])             
            //Screenshot of just table    
            //await rowHeaders.screenshot({ path: `images/${orderNum[i]}table.png` })            
            console.log(orderNum[i])
        }
    }
    catch{
        // await page.screenshot({ path: 'images/error.png' })
        // console.error(`Error message: ${e}`)
    }
    await context.close();
    await browser.close();
    return data
}

async function listMajors() {  
  // console.log(data)
  let indexes = []
  let orders = []
  let authorized = await auth.authorize()
  const sheets = google.sheets({version: 'v4', auth: authorized});
  // let vals = [[1],[2],[3],[4],[5]]
  try{
    let res = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.spreadsheetId,
      range: 'Overage Format2!O1:O2',
    });
    let rows = res.data.values;
    if (!rows || rows.length === 0) {
      console.log('No data found.');
      return;
    }  
    rows.map(a => indexes.push(a[0]))
    if (indexes[1] > 2)
      res = await sheets.spreadsheets.values.clear({
        spreadsheetId: process.env.spreadsheetId,
        range: `Overage Format2!K3:N${indexes[1]}`,
      })


    res = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.spreadsheetId,
      range: `Overage Format2!I2:I${indexes[0]}`,
    });
    rows = res.data.values;
    if (!rows || rows.length === 0) {
      console.log('No data found.');
      return;
    }
    rows.filter(a => a[0] !== undefined).map(a => orders.push(a[0]))       
    const temp = await getStuff2(orders)     
    

    const res2 = await sheets.spreadsheets.values.update({
      spreadsheetId: process.env.spreadsheetId,
      range: `Overage Format2!K3:N${temp.length + 2}`,
      valueInputOption: 'USER_ENTERED', //or 'RAW'
      resource:{
        //majorDimension: 'COLUMNS',
        values: temp
      }
    });

    console.log(res2.data)
  }
  catch(e){
    console.error(e)
  }
    
}
const readStuff = async () => {
  //await getStuff2()
  await listMajors()
}
setTimeout(() => [
  setInterval(()=>{
    let offset = -300; //Timezone offset for EST in minutes.
    let dt = new Date();
    dt.setTime(dt.getTime() + dt.getTimezoneOffset()*60*1000);
    let estDate = new Date(dt.getTime() + offset*60*1000);
      
    let hours = estDate.getHours() + 1
  
    if (hours >= 9 && hours <= 17)
      readStuff()
  },1000*60*2)
],1000)
// setInterval(()=>{
//   let offset = -300; //Timezone offset for EST in minutes.
//   let dt = new Date();
//   dt.setTime(dt.getTime() + dt.getTimezoneOffset()*60*1000);
//   let estDate = new Date(dt.getTime() + offset*60*1000);
    
//   let hours = estDate.getHours() + 1

//   if (hours >= 9 && hours <= 17)
//     readStuff()
// },1000*60*2)
//readStuff()

// npm install node-cron
// const cron = require('node-cron');

// // Schedule tasks to run every 30 minutes between 9 AM and 5 PM
// cron.schedule('0,30 9-17 * * 1-5', () => {
//   console.log('Running a task every 30 minutes between 9 AM and 5 PM');
//   // Place your code to be executed here
// }, {
//   scheduled: true,
//   timezone: 'America/New_York' // Replace with your timezone
// });