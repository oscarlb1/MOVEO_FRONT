import { test, expect, loginAsAdmin } from '../fixtures/auth.fixture'
import { DashboardPage } from '../pages/DashboardPage'

test.describe('Módulo 8 — Clientes CRUD', () => {

    test.beforeEach(async ({ page }) => {
        await loginAsAdmin(page)
        const dashboard = new DashboardPage(page)
        await dashboard.navigateTo('Clientes')
        await page.waitForTimeout(1000)
    })

    test('8.1 Tabla de clientes carga con título y datos', async ({ page }) => {
        await page.waitForFunction(() =>
            document.querySelectorAll('.animate-pulse').length === 0,
            { timeout: 15000 }
        )
        await expect(page.getByText('Gestión de Clientes').first()).toBeVisible()
        const rows = page.locator('table tbody tr')
        expect(await rows.count()).toBeGreaterThan(0)
    })

    test('8.2 Búsqueda de clientes por empresa/teléfono', async ({ page }) => {
        await page.waitForFunction(() =>
            document.querySelectorAll('.animate-pulse').length === 0,
            { timeout: 15000 }
        )
        const searchInput = page.locator('input[placeholder="Buscar empresa o teléfono..."]')
        await searchInput.fill('Madrid')
        await page.waitForTimeout(500)
    })

    test('8.3 Crear cliente: abrir modal y verificar formulario', async ({ page }) => {
        await page.waitForFunction(() =>
            document.querySelectorAll('.animate-pulse').length === 0,
            { timeout: 15000 }
        )
        const newBtn = page.getByText('Nuevo Cliente', { exact: true })
        await newBtn.click()
        await page.waitForTimeout(500)

        // Modal should be visible with title "Nuevo Cliente"
        const modal = page.locator('.fixed.inset-0.z-50').first()
        await expect(modal).toBeVisible()
        await expect(modal.getByText('Nuevo Cliente')).toBeVisible()
    })

    test('8.6 Botones exportar clientes en PDF y Excel', async ({ page }) => {
        const pdfBtn = page.getByTitle('Exportar PDF')
        const excelBtn = page.getByTitle('Exportar Excel')
        await expect(pdfBtn).toBeVisible()
        await expect(excelBtn).toBeVisible()
    })
})
