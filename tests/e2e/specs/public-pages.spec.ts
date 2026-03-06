import { test, expect } from '@playwright/test'
import { HeaderPage } from '../pages/HeaderPage'

test.describe('Módulo 2 — Páginas Públicas', () => {

    test('2.1 Landing page (/) carga con hero, nav y footer', async ({ page }) => {
        await page.goto('/')
        await page.waitForLoadState('networkidle')

        // Header nav should be visible
        const header = new HeaderPage(page)
        await expect(header.logo).toBeVisible()
        await expect(header.navInicio).toBeVisible()
        await expect(header.navServicios).toBeVisible()
        await expect(header.navDashboard).toBeVisible()

        // Hero section
        await expect(page.getByText('Moveo', { exact: true }).first()).toBeVisible()

        // Footer
        const footer = page.locator('footer')
        await expect(footer).toBeVisible()
    })

    test('2.2 Navegación del header: Inicio, Servicios, Dashboard links', async ({ page }) => {
        await page.goto('/')

        const header = new HeaderPage(page)

        // Navigate to Servicios
        await header.navServicios.click()
        await page.waitForURL('**/servicios')
        expect(page.url()).toContain('/servicios')

        // Navigate to Dashboard (unauthenticated → dashboard-demo)
        await header.navDashboard.click()
        await page.waitForURL('**/dashboard-demo')
        expect(page.url()).toContain('/dashboard-demo')

        // Navigate back to Inicio
        await header.navInicio.click()
        await page.waitForURL(/\/$/)
    })

    test('2.3 Servicios (/servicios) renderiza correctamente', async ({ page }) => {
        await page.goto('/servicios')
        await page.waitForLoadState('networkidle')

        // Page title/heading
        await expect(page.getByText('Servicios').first()).toBeVisible()

        // Footer
        await expect(page.locator('footer')).toBeVisible()
    })

    test('2.4 Dashboard Demo (/dashboard-demo) accesible sin login', async ({ page }) => {
        await page.goto('/dashboard-demo')
        await page.waitForLoadState('networkidle')

        // Should NOT redirect to login
        expect(page.url()).toContain('/dashboard-demo')

        // Should render chart/data content
        await expect(page.locator('.apexcharts-canvas').first()).toBeVisible({ timeout: 10000 })
    })

    test('2.5 Páginas legales renderizan correctamente', async ({ page }) => {
        // Privacidad
        await page.goto('/privacidad')
        await page.waitForLoadState('networkidle')
        await expect(page.locator('h1, h2').first()).toBeVisible()

        // Términos
        await page.goto('/terminos')
        await page.waitForLoadState('networkidle')
        await expect(page.locator('h1, h2').first()).toBeVisible()

        // Cookies
        await page.goto('/cookies')
        await page.waitForLoadState('networkidle')
        await expect(page.locator('h1, h2').first()).toBeVisible()
    })

    test('2.6 Contacto (/contacto) renderiza formulario e información', async ({ page }) => {
        await page.goto('/contacto')
        await page.waitForLoadState('networkidle')

        // Form should be visible
        await expect(page.locator('form').first()).toBeVisible()

        // Contact info section
        await expect(page.getByText('Contacto').first()).toBeVisible()
    })

    test('2.7 Header muestra botón login cuando no autenticado', async ({ page }) => {
        await page.goto('/')

        const header = new HeaderPage(page)
        await expect(header.loginButton).toBeVisible()
    })

    test('2.8 Header muestra avatar + dropdown cuando autenticado', async ({ page }) => {
        // Login first
        const { LoginPage } = await import('../pages/LoginPage')
        const loginPage = new LoginPage(page)
        await loginPage.goto()
        await loginPage.loginAndWait('admin@example.com', 'Admin123!')

        // Go to home
        await page.goto('/')
        await page.waitForLoadState('networkidle')

        const header = new HeaderPage(page)
        // Login button should NOT be visible
        await expect(header.loginButton).not.toBeVisible()

        // User avatar should be visible instead
        await expect(header.userDropdown).toBeVisible()
    })
})
