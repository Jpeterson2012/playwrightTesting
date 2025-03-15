import { test, expect } from '@playwright/test';
require('dotenv').config()
const MailosaurClient = require("mailosaur");
async function mail(){
        
    const mailosaur = new MailosaurClient(process.env.APIKEY);
    const result = await mailosaur.messages.get(process.env.SERVERID,{
        sentTo: `like-cast@${process.env.SERVERID}.mailosaur.net`
    });
    // expect(result.from[0].name).toEqual('Cloudflare')
    // expect(result.from[0].email).toEqual('noreply@notify.cloudflare.com')
    // console.log(result.html.codes.length)
    // console.log(result.html.codes[0])            
    console.log(result.text.body)
    let temp = new RegExp('([a-zA-Z0-9]{3}(-[a-zA-Z0-9]{3}))')
    let matches = temp.exec(result.text.body)    
    //return result.html.codes[0].value
    return matches![0].replace('-','').split('')
}
test.use({ storageState: 'playwright/.auth2.json' });

test('has title', async ({ page }) => {
    await page.setExtraHTTPHeaders({
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9'
    });
    await page.goto(`${process.env.SLACK}`);
    await new Promise(resolve => setTimeout(resolve, 500));
    await page.screenshot({ path: 'screenshot2.png' });
    
    await page.locator('div.tabbed_channel__Abx5r').first().hover()
    await page.mouse.move(0,500)
    let temp = await page.locator('div.p-rich_text_section').allInnerTexts()
    console.log(temp)

    // //await expect(page).toHaveTitle('Sign in ・ Cloudflare Access');
    
    // let email = process.env.username!    
    // await page.locator('input#domain').fill('hello-fello')
    // //await page.screenshot({ path: 'screenshot2.png' });
    // await page.getByRole('button').click()
    // await page.locator('input#signup_email').fill(email)
    // await page.locator('button#submit_btn').click()
    // let code = await mail()
    // // console.log(code)
    // // await Promise.all(code.map(async (a,i) => {        
    // //     let temp = `input[aria-label='digit ${i + 1} of 6']`
    // //     await page.locator(temp).fill(a)
    // // }))

    // let temp = "input[aria-label='digit 1 of 6']"
    // await page.locator(temp).fill(code[0])    
    // temp = "input[aria-label='digit 2 of 6']"
    // await page.locator(temp).fill(code[1])
    // temp = "input[aria-label='digit 3 of 6']"
    // await page.locator(temp).fill(code[2])
    // temp = "input[aria-label='digit 4 of 6']"
    // await page.locator(temp).fill(code[3])
    // temp = "input[aria-label='digit 5 of 6']"
    // await page.locator(temp).fill(code[4])
    // temp = "input[aria-label='digit 6 of 6']"
    // await page.locator(temp).fill(code[5])
      
    // await new Promise(resolve => setTimeout(resolve, 2500));
    // await page.screenshot({ path: 'screenshot.png' });
    // await page.context().storageState({ path: 'playwright/.auth2.json' });   
});


