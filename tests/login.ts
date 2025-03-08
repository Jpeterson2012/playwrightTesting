import { expect } from '@playwright/test';

export const login = async(page: any) => {

    await page.setExtraHTTPHeaders({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36',
            'Accept-Language': 'en-US,en;q=0.9'
        });
    await page.goto('https://ims.fello.com');

    await expect(page).toHaveTitle('Sign in ・ Cloudflare Access');
    
    let email = process.env.username!
    let pw = process.env.pw!
    await page.locator('input.EmailInput').fill(email)
    await page.screenshot({ path: 'screenshot2.png' });
    await page.getByRole('button').click()
    let code = await mail()
    
    await page.getByRole('button', {name: 'Sign In'}).click()
    await page.locator('input.StandardInput-is-entry-code').fill(code)
                  
    await page.screenshot({ path: 'screenshot.png' });
    await page.locator('input#email').fill(email)
    await page.locator('input#password').fill(pw)
    await page.getByRole('button', {name: /Login/}).click()
    await page.context().storageState({ path: 'playwright/.auth.json' }); 

    await page.screenshot({ path: 'screenshot3.png' });
}