//rm *.png
//node --env-file .env script.js
import { chromium } from 'playwright';

let email = process.env.username;
let pw = process.env.pw;

function currentDate(){
    let offset = -300; //Timezone offset for EST in minutes.
    let dt = new Date();
    dt.setTime(dt.getTime()+dt.getTimezoneOffset()*60*1000);
    let estDate = new Date(dt.getTime() + offset*60*1000);
    
    let hours = String(estDate.getHours()).padStart(2, '0');
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
        await page.screenshot({ path: `${orderNum[i]}.png`, fullPage: true });  
    }
  }
  catch(e) {
    console.error(`Error message: ${e}`)
  }

  // Teardown
  await context.close();
  await browser.close();
};

const getStuff = async () => {
    const browser = await chromium.launch();
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
            await page.screenshot({ path: `${orderNum[i]}.png` });
            

            // await page.locator('table#orderDetail').screenshot({ path: `${orderNum}table.png` })

            let rowHeaders = page.locator('table#orderDetail')
            let tableHeaders = await rowHeaders.locator('th').allInnerTexts()
            //Filter Method
            let tableRows = await rowHeaders.locator('tr').filter( {hasText: /(ipad|iphone|mcc|hotspot)/i} ).filter( {hasNotText: 'for'} ).allInnerTexts()
            let temp2 = []
            temp2.push(tableHeaders.slice(0, tableHeaders.length - 1))
            tableRows.map(a => {
                let tempRow = a.split('\t') 
                temp2.push( tempRow.slice(0,tempRow.length - 1)) 
            })
            console.log(temp2)

            let tableContent = await rowHeaders.locator('td').allInnerTexts()        
            //Screenshot of just table    
            await rowHeaders.screenshot({ path: `${orderNum[i]}table.png` })
            //No Filter Method
            let temp = []
            temp.push(tableHeaders.slice(0, tableHeaders.length - 1))
            for (let i = 0; i < tableContent.length; i += 5){
                temp.push([ tableContent[i], tableContent[i + 1], tableContent[i + 2], tableContent[i + 3] ])
            }
            // console.log(a.slice(0,a.length - 1))
            console.log(`${orderNum[i]} ${currentDate()}`)
            console.log(temp)
            console.log('\n')

            // let rowHeaders = await page.locator('table#orderDetail th').all()
        }
    }
    catch (e){
        await page.screenshot({ path: 'error.png' })
        console.error(`Error message: ${e}`)
    }

    await context.close();
    await browser.close();
}

// firstTest()
getStuff()