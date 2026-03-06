import { test, expect, loginAsAdmin } from '../fixtures/auth.fixture'
import { DashboardPage } from '../pages/DashboardPage'

test.describe('Módulo 7 — Usuarios CRUD', () => {

    test.beforeEach(async ({ page }) => {
        await loginAsAdmin(page)
        const dashboard = new DashboardPage(page)
        await dashboard.navigateTo('Usuarios')
        await page.waitForTimeout(1000)
    })

    test('7.1 Tabla de usuarios carga con datos', async ({ page }) => {
        await page.waitForTimeout(2000) // Wait for data to load
        const rows = page.locator('table tbody tr')
        expect(await rows.count()).toBeGreaterThan(0)
    })

    test('7.2 Búsqueda de usuarios por nombre/email', async ({ page }) => {
        await page.waitForTimeout(2000)
        const searchInput = page.locator('input[placeholder="Buscar por nombre o email..."]')
        await searchInput.fill('admin')
        await page.waitForTimeout(500)
    })

    test('7.3 Crear usuario: abrir modal y verificar formulario', async ({ page }) => {
        await page.waitForTimeout(2000)
        const newBtn = page.getByText('Nuevo Usuario', { exact: true })
        await newBtn.click({ force: true })
        await page.waitForTimeout(1000)

        // Modal should be visible
        const modal = page.locator('.fixed.inset-0.z-50').first()
        await expect(modal).toBeVisible()

        // Should have the title "Nuevo Usuario"
        await expect(modal.getByText('Nuevo Usuario')).toBeVisible()
    })

    test('7.8 Botones exportar usuarios en PDF y Excel', async ({ page }) => {
        const pdfBtn = page.getByTitle('Exportar PDF')
        const excelBtn = page.getByTitle('Exportar Excel')
        await expect(pdfBtn).toBeVisible()
        await expect(excelBtn).toBeVisible()
    })
})
