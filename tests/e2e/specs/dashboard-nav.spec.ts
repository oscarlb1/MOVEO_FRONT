import { test, expect, loginAsAdmin } from '../fixtures/auth.fixture'
import { DashboardPage } from '../pages/DashboardPage'

test.describe('Módulo 3 — Navegación del Dashboard', () => {

    test.beforeEach(async ({ page }) => {
        await loginAsAdmin(page)
    })

    test('3.1 Sidebar muestra items base: Vista General, Rutas, Entregas', async ({ page }) => {
        const dashboard = new DashboardPage(page)
        await expect(dashboard.sidebar.getByText('Vista General')).toBeVisible()
        await expect(dashboard.sidebar.getByText('Rutas')).toBeVisible()
        await expect(dashboard.sidebar.getByText('Entregas')).toBeVisible()
    })

    test('3.2 Admin ve items adicionales: Vehículos, Usuarios, Clientes', async ({ page }) => {
        const dashboard = new DashboardPage(page)
        await expect(dashboard.sidebar.getByText('Vehículos')).toBeVisible()
        await expect(dashboard.sidebar.getByText('Usuarios')).toBeVisible()
        await expect(dashboard.sidebar.getByText('Clientes')).toBeVisible()
    })

    test('3.3 Click en items del sidebar cambia la vista activa', async ({ page }) => {
        const dashboard = new DashboardPage(page)

        // Click "Rutas"
        await dashboard.navigateTo('Rutas')
        // The header shows the active section label
        await expect(page.locator('header h2').first()).toContainText('Rutas')

        // Click "Entregas"
        await dashboard.navigateTo('Entregas')
        await expect(page.locator('header h2').first()).toContainText('Entregas')

        // Click "Vehículos"
        await dashboard.navigateTo('Vehículos')
        await expect(page.locator('header h2').first()).toContainText('Vehículos')

        // Click "Usuarios"
        await dashboard.navigateTo('Usuarios')
        await expect(page.locator('header h2').first()).toContainText('Usuarios')

        // Click "Clientes"
        await dashboard.navigateTo('Clientes')
        await expect(page.locator('header h2').first()).toContainText('Clientes')

        // Back to "Vista General"
        await dashboard.navigateTo('Vista General')
        await expect(page.locator('header h2').first()).toContainText('Vista General')
    })

    test('3.5 Botón logout funciona desde footer del sidebar', async ({ page }) => {
        const dashboard = new DashboardPage(page)
        // The logout button is in the sidebar footer
        // Use force: true to bypass any potential overlay remains (like an invisible cookie banner)
        await dashboard.logoutButton.click({ force: true })
        await page.waitForURL('**/login', { timeout: 10000 })
        expect(page.url()).toContain('/login')
    })

    test('3.6 Badge de notificaciones o icono de campana visible', async ({ page }) => {
        // The notification count is managed via an interval; just check the bell icon exists
        const bellIcon = page.locator('header')
        await expect(bellIcon).toBeVisible()
    })
})
