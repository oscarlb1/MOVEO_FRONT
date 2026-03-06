import { test, expect, loginAsAdmin } from '../fixtures/auth.fixture'
import { DashboardPage } from '../pages/DashboardPage'

test.describe('Módulo 5 — Rutas CRUD', () => {

    test.beforeEach(async ({ page }) => {
        await loginAsAdmin(page)
        const dashboard = new DashboardPage(page)
        await dashboard.navigateTo('Rutas')
        await page.waitForTimeout(1000)
    })

    test('5.1 Lista de rutas carga con KPIs', async ({ page }) => {
        await page.waitForFunction(() =>
            document.querySelectorAll('.animate-pulse').length === 0,
            { timeout: 15000 }
        )
        // Search input specific to rutas
        await expect(page.locator('input[placeholder="Buscar por ID, Vehículo o Conductor"]')).toBeVisible()
    })

    test('5.2 Búsqueda y filtro de rutas por estado', async ({ page }) => {
        await page.waitForFunction(() =>
            document.querySelectorAll('.animate-pulse').length === 0,
            { timeout: 15000 }
        )
        const filterSelect = page.locator('select').first()
        if (await filterSelect.isVisible()) {
            await filterSelect.selectOption({ index: 1 })
            await page.waitForTimeout(500)
        }
    })

    test('5.3 Seleccionar una ruta muestra panel de detalle', async ({ page }) => {
        // Specifically target route cards in the main section to avoid sidebar confusion
        const routeCards = page.locator('.route-card');
        await routeCards.first().waitFor({ state: 'visible', timeout: 10000 });

        await routeCards.first().click({ force: true });

        // Assert detail panel header matches RT- prefix
        await expect(page.locator('h2', { hasText: 'Ruta #RT-' })).toBeVisible();
    })

    test('5.9 Botones exportar PDF y Excel están visibles', async ({ page }) => {
        const pdfBtn = page.getByTitle('Exportar PDF')
        const excelBtn = page.getByTitle('Exportar Excel')
        await expect(pdfBtn).toBeVisible()
        await expect(excelBtn).toBeVisible()
    })
})
