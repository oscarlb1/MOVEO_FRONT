import { type Page, type Locator } from '@playwright/test'

export class HeaderPage {
    readonly page: Page
    readonly logo: Locator
    readonly navInicio: Locator
    readonly navServicios: Locator
    readonly navDashboard: Locator
    readonly loginButton: Locator
    readonly contactButton: Locator
    readonly userDropdown: Locator
    readonly dropdownMenu: Locator

    constructor(page: Page) {
        this.page = page
        this.logo = page.locator('nav a').filter({ hasText: 'Moveo' }).first()
        this.navInicio = page.locator('nav a[href="/"]').first()
        this.navServicios = page.locator('nav a[href="/servicios"]')
        this.navDashboard = page.locator('nav').getByText('Dashboard', { exact: true })
        this.loginButton = page.getByText('Iniciar sesión', { exact: true })
        this.contactButton = page.locator('nav a[href="/contacto"]')
        this.userDropdown = page.locator('nav .relative .w-11.h-11')
        this.dropdownMenu = page.locator('nav .absolute.top-full')
    }

    async isAuthenticated(): Promise<boolean> {
        return this.userDropdown.isVisible()
    }
}
