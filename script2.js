//rm *.png
//node --env-file .env script.js
const chromium = require('playwright');

const getStuff2 = async() => {
  const browser = await chromium.chromium.launch();
    const context = await browser.newContext({storageState: 'playwright/.auth2.json'})
    const page = await context.newPage();    

    try{
        await page.goto(`${process.env.SLACK}`);
    await new Promise(resolve => setTimeout(resolve, 500));
    await page.screenshot({ path: 'screenshot2.png' });
    
    await page.locator('div.tabbed_channel__Abx5r').first().hover()
    // await page.mouse.move(0,-2500)
    await page.mouse.wheel(0,-1500)
    await new Promise(resolve => setTimeout(resolve, 500));
    await page.mouse.wheel(0,-1500)
    await new Promise(resolve => setTimeout(resolve, 500));
    await page.mouse.wheel(0,-1500)
    await page.screenshot({ path: 'screenshot.png' });
    let temp = await page.locator('div.p-rich_text_section').allInnerTexts()
    let temp2 = []
    temp.map(a => temp2.push(a.replaceAll('#','').split('\n')))
    console.log(temp2)
    }
    catch{
        // await page.screenshot({ path: 'images/error.png' })
        // console.error(`Error message: ${e}`)
    }
    await context.close();
    await browser.close();    
}



const readStuff = async () => {
  await getStuff2()    
}
readStuff()

