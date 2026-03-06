import { type Page, type Locator } from '@playwright/test'

export class LoginPage {
    readonly page: Page
    readonly emailInput: Locator
    readonly passwordInput: Locator
    readonly submitButton: Locator
    readonly showPasswordButton: Locator
    readonly rememberMeCheckbox: Locator
    readonly moveoLogo: Locator
    readonly contactButton: Locator

    constructor(page: Page) {
        this.page = page
        this.emailInput = page.locator('#email')
        this.passwordInput = page.locator('#password')
        this.submitButton = page.locator('button[type="submit"]')
        this.showPasswordButton = page.locator('button').filter({ has: page.locator('svg') }).nth(0)
        this.rememberMeCheckbox = page.locator('input[type="checkbox"]')
        this.moveoLogo = page.locator('.inline-flex.items-center.gap-2.mb-4.cursor-pointer')
        this.contactButton = page.getByText('Contactar con soporte')
    }

    async goto() {
        await this.page.goto('/login')
    }

    async login(email: string, password: string) {
        await this.emailInput.fill(email)
        await this.passwordInput.fill(password)
        await this.submitButton.click()
    }

    async loginAndWait(email: string, password: string) {
        await this.login(email, password)
        // Wait for navigation away from login
        await this.page.waitForURL(/\/(dashboard|configuracion|$)/, { timeout: 10000 })
    }

    async getErrorToast() {
        return this.page.locator('[data-sonner-toast]').first()
    }

    async isLoading() {
        return this.page.locator('.animate-spin').isVisible()
    }
}
