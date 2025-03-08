import { test, expect } from '@playwright/test';
const MailosaurClient = require("mailosaur");
async function mail(){
        
    const mailosaur = new MailosaurClient(process.env.APIKEY);
    const result = await mailosaur.messages.get(process.env.SERVERID,{
        sentTo: `like-cast@${process.env.SERVERID}.mailosaur.net`
    });

    expect(result.from[0].name).toEqual('Cloudflare')
    expect(result.from[0].email).toEqual('noreply@notify.cloudflare.com')
    // console.log(result.html.codes.length)
    // console.log(result.html.codes[0])
    return result.html.codes[0].value
}


test('has title', async ({ page }) => {
    await page.setExtraHTTPHeaders({
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9'
    });
    await page.goto(`${process.env.LOGIN}`);

    await expect(page).toHaveTitle('Sign in ・ Cloudflare Access');
    
    let email = process.env.username!
    let pw = process.env.pw!
    await page.locator('input.EmailInput').fill(email)
    await page.screenshot({ path: 'screenshot2.png' });
    await page.getByRole('button').click()
    let code = await mail()

    await page.locator('input.StandardInput-is-entry-code').fill(code)
    await page.getByRole('button', {name: 'Sign In'}).click()
    

  // Expect a title "to contain" a substring.
  await page.screenshot({ path: 'screenshot.png' });
  await page.locator('input#email').fill(email)
  await page.locator('input#password').fill(pw)
  await page.getByRole('button', {name: /Login/}).click()
  await page.context().storageState({ path: 'playwright/.auth.json' }); 

  await page.screenshot({ path: 'screenshot3.png' });

  await page.goto(`${process.env.CHECKOUT}CB10174`)
  await page.screenshot({ path: 'screenshot4.png' });

});


