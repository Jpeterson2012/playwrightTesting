import { test, expect } from '@playwright/test';

test.use({ storageState: 'playwright/.auth.json' });
let email = process.env.username!
let pw = process.env.pw!

test('has title', async ({ page }) => {
    await page.goto('https://ims.fello.com');        
    await page.locator('input#email').fill(email)
    await page.locator('input#password').fill(pw)
    await page.getByRole('button', {name: /Login/}).click()

    await page.goto(`${process.env.CHECKOUT}CB10063`);
    // await page.waitForLoadState('domcontentloaded');        
        
    // await page.waitForLoadState('load');
    await page.waitForFunction("() => document.querySelector('.loading-spinner').style.display === 'none'")
    await expect(page.locator('form#checkoutOrderFrm')).toBeVisible();
    await expect(page.locator('table#orderDetail')).toBeVisible();
    await new Promise(resolve => setTimeout(resolve, 1000));
    await page.screenshot({ path: 'screenshot5.png', fullPage: true });

    await page.goto(`${process.env.CHECKOUT}CB10152`);
    // await page.waitForLoadState('load');
    await page.waitForFunction("() => document.querySelector('.loading-spinner').style.display === 'none'")    
    await expect(page.locator('form#checkoutOrderFrm')).toBeVisible();
    await expect(page.locator('table#orderDetail')).toBeVisible();
    await new Promise(resolve => setTimeout(resolve, 1000));
    await page.screenshot({ path: 'screenshot6.png', fullPage: true });

    await page.goto(`${process.env.CHECKOUT}SQ9761`);
    // await page.waitForLoadState('load');
    await page.waitForFunction("() => document.querySelector('.loading-spinner').style.display === 'none'")    
    await expect(page.locator('form#checkoutOrderFrm')).toBeVisible();
    await expect(page.locator('table#orderDetail')).toBeVisible();
    await new Promise(resolve => setTimeout(resolve, 1000));
    await page.screenshot({ path: 'screenshot7.png', fullPage: true });
    
})