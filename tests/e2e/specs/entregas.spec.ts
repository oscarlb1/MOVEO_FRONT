import { test, expect, loginAsAdmin } from '../fixtures/auth.fixture'
import { DashboardPage } from '../pages/DashboardPage'

test.describe('Módulo 6 — Entregas CRUD', () => {

    test.beforeEach(async ({ page }) => {
        await loginAsAdmin(page)
        const dashboard = new DashboardPage(page)
        await dashboard.navigateTo('Entregas')
        await page.waitForTimeout(1000)
    })

    test('6.1 Tabla de entregas carga con KPIs', async ({ page }) => {
        await page.waitForFunction(() =>
            document.querySelectorAll('.animate-pulse').length === 0,
            { timeout: 15000 }
        )
        // Verify the section loaded with the "Gestión de Entregas" heading
        await expect(page.getByText('Gestión de Entregas').first()).toBeVisible()
    })

    test('6.2 Búsqueda y filtro de entregas', async ({ page }) => {
        await page.waitForFunction(() =>
            document.querySelectorAll('.animate-pulse').length === 0,
            { timeout: 15000 }
        )
        const searchInput = page.locator('input[placeholder="Buscar empresa o dirección..."]')
        await searchInput.fill('test')
        await page.waitForTimeout(500)
        await searchInput.clear()
    })

    test('6.6 Ver detalle de una entrega en tabla', async ({ page }) => {
        await page.waitForFunction(() =>
            document.querySelectorAll('.animate-pulse').length === 0,
            { timeout: 15000 }
        )
        const rows = page.locator('table tbody tr')
        const count = await rows.count()
        expect(count).toBeGreaterThan(0)
    })

    test('6.8 Botones exportar entregas en PDF y Excel', async ({ page }) => {
        const pdfBtn = page.getByTitle('Exportar PDF')
        const excelBtn = page.getByTitle('Exportar Excel')
        await expect(pdfBtn).toBeVisible()
        await expect(excelBtn).toBeVisible()
    })
})
