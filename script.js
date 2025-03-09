//rm *.png
//node --env-file .env script.js
//"type": "module",
// import { chromium } from 'playwright';
// import {authorize} from './index.js'
const chromium = require('playwright');
const auth = require('./index.js')
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

let firstTest = async () => {
  // Setup
  const browser = await chromium.launch();
//   const context = await browser.newContext();
  const context = await browser.newContext({storageState: 'playwright/.auth.json'})

  const page = await context.newPage();

  try{
    let orderNum = ['CB10063','CB10152','SQ9761']
    // The actual interesting bit  
    await page.goto(`${process.env.LOGIN}`);     
    await page.screenshot({ path: 'screenshot.png', fullPage: true });   
    await page.locator('input#email').fill(email)
    await page.locator('input#password').fill(pw)
    await page.getByRole('button', {name: /Login/}).click()  

    for (let i = 0; i < orderNum.length; i++){        

        await page.goto(`${process.env.CHECKOUT}${orderNum[i]}`);             
        await page.waitForFunction("() => document.querySelector('.loading-spinner').style.display === 'none'")
          //   await page.locator('.loading-spinner').isHidden()
        await page.locator('form#checkoutOrderFrm').isVisible()
        await page.locator('table#orderDetail').isVisible()
        await new Promise(resolve => setTimeout(resolve, 500));
        await page.screenshot({ path: `images/${orderNum[i]}.png`, fullPage: true });  
    }
  }
  catch(e) {
    console.error(`Error message: ${e}`)
  }

  // Teardown
  await context.close();
  await browser.close();
};
// let data = []
const getStuff = async () => {
    const browser = await chromium.chromium.launch();
    const context = await browser.newContext({storageState: 'playwright/.auth.json'})
    const page = await context.newPage();

    try{
        let orderNum = ['EB2311','LE1723','EB2400']
        await page.goto(`${process.env.LOGIN}`);       
        await page.locator('input#email').fill(email)
        await page.locator('input#password').fill(pw)
        await page.getByRole('button', {name: /Login/}).click()  

        for (let i = 0; i < orderNum.length; i++){           
            
            await page.goto(`${process.env.CHECKIN}${orderNum[i]}`);        

            await page.waitForLoadState('load');                      
            await page.locator('form#checkoutOrderFrm').waitFor()
            await page.locator('table#orderDetail').waitFor()
            // await page.waitForFunction("() => document.querySelector('div.loading-spinner').style.display === 'none'")        
            await page.waitForSelector('div.loading-spinner', { state: 'hidden' })
            await new Promise(resolve => setTimeout(resolve, 500));
            await page.screenshot({ path: `images/${orderNum[i]}.png` });
            

            // await page.locator('table#orderDetail').screenshot({ path: `${orderNum}table.png` })

            let rowHeaders = page.locator('table#orderDetail')
            // let tableHeaders = await rowHeaders.locator('th').allInnerTexts()
            //Filter Method
            let tableRows = await rowHeaders.locator('tr').filter( {hasText: /(ipad|iphone|mcc|hotspot)/i} ).filter( {hasNotText: 'for'} ).allInnerTexts()
            let temp2 = []
            // temp2.push(tableHeaders.slice(0, tableHeaders.length - 1))
            // temp2.push([orderNum[i],currentDate(),'',''])
            data.push([orderNum[i],currentDate(),'',''])            
            tableRows.map(a => {
                let tempRow = a.split('\t') 
                temp2.push( tempRow.slice(0,tempRow.length - 1))
                data.push( tempRow.slice(0,tempRow.length - 1)) 
            })
            data.push(['','','',''])
            // data.push(temp2)
            // console.log(temp2)
            

            // let tableContent = await rowHeaders.locator('td').allInnerTexts()        
            //Screenshot of just table    
            await rowHeaders.screenshot({ path: `images/${orderNum[i]}table.png` })
            //No Filter Method
            // let temp = []
            // temp.push(tableHeaders.slice(0, tableHeaders.length - 1))
            // for (let i = 0; i < tableContent.length; i += 5){
            //     temp.push([ tableContent[i], tableContent[i + 1], tableContent[i + 2], tableContent[i + 3] ])
            // }
            // // console.log(a.slice(0,a.length - 1))
            // console.log(`${orderNum[i]} ${currentDate()}`)
            // console.log(temp)
            // console.log('\n')

            // let rowHeaders = await page.locator('table#orderDetail th').all()
        }
    }
    catch (e){
        await page.screenshot({ path: 'images/error.png' })
        console.error(`Error message: ${e}`)
    }

    await context.close();
    await browser.close();
}
const getStuff2 = async(orderNum) => {
  const browser = await chromium.chromium.launch();
    const context = await browser.newContext({storageState: 'playwright/.auth.json'})
    const page = await context.newPage();
    let data = []

    try{
        // let orderNum = ['EB2311','LE1723','EB2400']
        await page.goto(`${process.env.LOGIN}`);       
        await page.locator('input#email').fill(email)
        await page.locator('input#password').fill(pw)
        await page.getByRole('button', {name: /Login/}).click()  

        for (let i = 0; i < orderNum.length; i++){           
            
            await page.goto(`${process.env.CHECKIN}${orderNum[i]}`);        

            await page.waitForLoadState('load');                      
            await page.locator('form#checkoutOrderFrm').waitFor()
            await page.locator('table#orderDetail').waitFor()               
            await page.waitForSelector('div.loading-spinner', { state: 'hidden' })
            // await new Promise(resolve => setTimeout(resolve, 500));
            // await page.screenshot({ path: `images/${orderNum[i]}.png` });                      

            let rowHeaders = page.locator('table#orderDetail')            
            //Filter Method
            let tableRows = await rowHeaders.locator('tr').filter( {hasText: /(ipad|iphone|mcc|hotspot)/i} ).filter( {hasNotText: 'for'} ).allInnerTexts()                       
            data.push([`=HYPERLINK("${process.env.CHECKIN}${orderNum[i]}","${orderNum[i]}")`,currentDate(),'',''])            
            tableRows.map(a => {
                let tempRow = a.split('\t')                 
                data.push( tempRow.slice(0,tempRow.length - 1)) 
            })
            data.push(['','','',''])             
            //Screenshot of just table    
            // await rowHeaders.screenshot({ path: `images/${orderNum[i]}table.png` })            
            console.log(orderNum[i])
        }
    }
    catch (e){
        await page.screenshot({ path: 'images/error.png' })
        console.error(`Error message: ${e}`)
    }
    await context.close();
    await browser.close();
    return data
}

// firstTest()
// getStuff()

// setInterval(()=>{
//   let hour = new Date().getHours()
//   if (hour >= 9 && hour <= 17)
//     getStuff()
// },1000*60*30)

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
      range: 'Overage Format!O1:O2',
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
        range: `Overage Format!K3:N${indexes[1]}`,
      })


    res = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.spreadsheetId,
      range: `Overage Format!I2:I${indexes[0]}`,
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
      range: `Overage Format!K3:N${temp.length + 2}`,
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
  // await getStuff2()  
  await listMajors()
}
// setInterval(()=>{
//   let hour = new Date().getHours()
//   if (hour >= 9 && hour <= 17)
//     readStuff()
// },1000*60*15)
readStuff()

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
