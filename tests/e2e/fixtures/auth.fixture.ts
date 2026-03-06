import { test as base, expect, type Page } from '@playwright/test'
import { LoginPage } from '../pages/LoginPage'
import { DashboardPage } from '../pages/DashboardPage'

// Test credentials — these must match real users in your database
export const ADMIN_CREDENTIALS = {
    email: 'b@gmail.com',
    password: '1234',
}

export const REPARTIDOR_CREDENTIALS = {
    email: 'a@gmail.com',
    password: '1234',
}

export async function handleCookies(page: Page) {
    try {
        const acceptCookiesButton = page.getByRole('button', { name: /aceptar todas/i })
        // Try to find and click the banner with a very short timeout
        if (await acceptCookiesButton.isVisible({ timeout: 2000 })) {
            await acceptCookiesButton.click({ timeout: 2000 })
            await page.waitForTimeout(500) // Small wait for animation
        }
    } catch (e) {
        // Ignore errors if banner doesn't appear or click fails
        console.log('Cookie banner not found or already dismissed, continuing...');
    }
}

/**
 * Logs in as admin and navigates to the dashboard.
 * Returns the DashboardPage POM for immediate use.
 */
export async function loginAsAdmin(page: Page): Promise<DashboardPage> {
    const loginPage = new LoginPage(page)
    await loginPage.goto()

    await handleCookies(page)

    await loginPage.loginAndWait(ADMIN_CREDENTIALS.email, ADMIN_CREDENTIALS.password)

    // Redundant check for dashboard-level banner reappearances
    await handleCookies(page)

    const dashboard = new DashboardPage(page)
    return dashboard
}

/**
 * Extended test fixture that provides pre-authenticated pages.
 */
export const test = base.extend<{
    loginPage: LoginPage
    dashboardPage: DashboardPage
    adminPage: DashboardPage
}>({
    loginPage: async ({ page }, use) => {
        const loginPage = new LoginPage(page)
        await loginPage.goto()
        await handleCookies(page)
        await use(loginPage)
    },
    dashboardPage: async ({ page }, use) => {
        const dashboardPage = new DashboardPage(page)
        await handleCookies(page)
        await use(dashboardPage)
    },
    adminPage: async ({ page }, use) => {
        const dashboard = await loginAsAdmin(page)
        await use(dashboard)
    },
})

export { expect } from '@playwright/test'
