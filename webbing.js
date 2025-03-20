const chromium = require('playwright');
const auth = require('./index.js')
const {google} = require('googleapis');

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
  
    //return `${hours}:${minutes}:${seconds} ${ampm}`
    return `${month}/${day}/${year} ${hours}:${minutes}:${seconds} ${ampm}`
}

const getWebbing = async() => {
    const browser = await chromium.chromium.launch();
    const context = await browser.newContext({storageState: 'playwright2/.auth3.json'})
    //const context = await browser.newContext()
    const page = await context.newPage();
    
    try{
      await page.goto('https://my.iamwebbing.com/pages/customer/branches_list.aspx');
      await new Promise(resolve => setTimeout(resolve, 500));
      await page.screenshot({ path: 'images/webbing.png' });

      let table = page.getByRole('table')
      let tableRows = await table.locator('tr').allInnerTexts()    
      let temp = []
      
      tableRows.map(a => temp.push(a.split('\t')))
      
     let select = 'a#ctl00_ctl00_MainBody_MainContent_PagingPanel_Next'
      while (await page.isVisible(select)){
        await page.locator(select).click()
        await new Promise(resolve => setTimeout(resolve, 1500));
        table = page.getByRole('table')
        tableRows = await table.locator('tr').allInnerTexts()
        tableRows.map(a => temp.push(a.split('\t')))
      }

    temp = temp.filter(a => !a.includes('Name')).map(a => a.filter(b => b !== ''))
    return temp

    //   await page.locator('input#usernameInput').fill(process.env.username)
    //   await page.locator('input#passwordInput').fill(process.env.pw)
    //   await page.locator('button.btn.btn-primary.w-100.pull-right.mt-4').click()
    //   await new Promise(resolve => setTimeout(resolve, 2500));

    //   await page.screenshot({ path: 'images/webbing2.png' });

    //   await page.locator('input#usernameInput').fill('008423')
    //   await page.locator('input#rememberDevice').setChecked(true)
    //   await page.locator('button.btn.btn-primary.w-100.pull-right.mt-4').click()

    //   await new Promise(resolve => setTimeout(resolve, 2500));

    //   await page.screenshot({ path: 'images/webbing3.png' });
      
    //   await context.storageState({ path: 'playwright/.auth3.json' })

    }
    catch (e) {console.error(`Error message: ${e}`)}
}
async function googleSheets(temp) {  
    temp.unshift(['','Last Retrieval',currentDate(),''])
    
    let authorized = await auth.authorize()
    const sheets = google.sheets({version: 'v4', auth: authorized});
  
    try{
      let res = await sheets.spreadsheets.values.get({
            spreadsheetId: process.env.spreadsheetId,
            range: 'Overage Format2!X1',
      });
      let rows = res.data.values;
      if (rows[0][0] > 1){
        res = await sheets.spreadsheets.values.clear({
            spreadsheetId: process.env.spreadsheetId,
            range: `Overage Format2!T2:W${rows[0][0]}`,
          })
      }
      
      //Update orders read from slack  
      let res2 = await sheets.spreadsheets.values.update({
        spreadsheetId: process.env.spreadsheetId,
        range: `Overage Format2!T2:W${temp.length + 1}`,
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
    let data = await getWebbing()
    await googleSheets(data)    
  }  
setInterval(()=>{
  readStuff()
},1000*60*10)
//readStuff()