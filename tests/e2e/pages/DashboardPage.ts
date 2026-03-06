import { type Page, type Locator } from '@playwright/test'

export class DashboardPage {
    readonly page: Page
    readonly sidebar: Locator
    readonly mainContent: Locator
    readonly logoutButton: Locator
    readonly darkModeToggle: Locator
    readonly userAvatar: Locator
    readonly userName: Locator
    readonly notificationBadge: Locator
    readonly mobileMenuButton: Locator

    constructor(page: Page) {
        this.page = page
        this.sidebar = page.locator('aside')
        this.mainContent = page.locator('main')
        this.logoutButton = page.getByText('Cerrar sesión').first()
        this.darkModeToggle = page.locator('button').filter({ has: page.locator('svg.w-5.h-5') }).first()
        this.userAvatar = page.locator('.w-10.h-10.rounded-full').first()
        this.userName = page.locator('aside .font-semibold.text-sm').first()
        this.notificationBadge = page.locator('.bg-red-500, .bg-\\[\\#E67E50\\]').first()
        this.mobileMenuButton = page.locator('button.lg\\:hidden').first()
    }

    async goto() {
        await this.page.goto('/dashboard')
        await this.page.waitForLoadState('networkidle')
    }

    /** Click a sidebar nav item by its label text */
    async navigateTo(section: string) {
        await this.sidebar.getByText(section, { exact: true }).click({ force: true })
        // Small wait for the view to swap
        await this.page.waitForTimeout(500)
    }

    /** Get the currently active sidebar button */
    async getActiveSection(): Promise<string | null> {
        const activeBtn = this.sidebar.locator('button.bg-\\[\\#E67E50\\], button.bg-gradient-to-r')
        const count = await activeBtn.count()
        if (count === 0) return null
        return activeBtn.first().innerText()
    }

    /** Check if a sidebar item is visible */
    async isSectionVisible(label: string): Promise<boolean> {
        return this.sidebar.getByText(label, { exact: true }).isVisible()
    }

    async logout() {
        // Aggressively handle cookie banner if it blocks the logout button
        const banner = this.page.getByText(/aceptar todas/i)
        if (await banner.isVisible({ timeout: 2000 }).catch(() => false)) {
            await banner.click({ force: true })
            await this.page.waitForTimeout(500)
        }
        await this.logoutButton.click({ force: true })
    }

    /** Wait for data to finish loading (skeleton placeholders disappear) */
    async waitForDataLoad() {
        await this.page.waitForFunction(() => {
            return document.querySelectorAll('.animate-pulse').length === 0
        }, { timeout: 15000 })
    }
}
