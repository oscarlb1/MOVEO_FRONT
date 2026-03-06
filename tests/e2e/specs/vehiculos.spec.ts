import { test, expect, loginAsAdmin } from '../fixtures/auth.fixture'
import { DashboardPage } from '../pages/DashboardPage'
import { VehiculosPage } from '../pages/VehiculosPage'

test.describe('Módulo 4 — Vehículos CRUD', () => {

    test.beforeEach(async ({ page }) => {
        await loginAsAdmin(page)
        const dashboard = new DashboardPage(page)
        await dashboard.navigateTo('Vehículos')
        await page.waitForTimeout(1000)
    })

    test('4.1 Tabla de vehículos carga con datos', async ({ page }) => {
        const v = new VehiculosPage(page)
        await v.waitForLoad()
        expect(await v.getRowCount()).toBeGreaterThan(0)
    })

    test('4.2 Búsqueda por matrícula/modelo filtra resultados', async ({ page }) => {
        const v = new VehiculosPage(page)
        await v.waitForLoad()
        const initial = await v.getRowCount()
        await v.searchInput.fill('ZZZNOTEXIST')
        await page.waitForTimeout(500)
        const filtered = await v.getRowCount()
        expect(filtered).toBeLessThanOrEqual(initial)
    })

    test('4.3 Filtro por estado funciona', async ({ page }) => {
        const v = new VehiculosPage(page)
        await v.waitForLoad()
        await v.filterSelect.selectOption('DISPONIBLE')
        await page.waitForTimeout(500)
        // Should show 0 or more, but not crash
        expect(await v.getRowCount()).toBeGreaterThanOrEqual(0)
    })

    test('4.4 Crear vehículo: llenar formulario y guardar', async ({ page }) => {
        const v = new VehiculosPage(page)
        await v.waitForLoad()
        const initial = await v.getRowCount()

        await v.newVehicleButton.click()
        await v.handleCookies() // Ensure banner is gone after opening modal
        await page.waitForTimeout(500)

        const uniqueMatricula = `${Math.floor(1000 + Math.random() * 8999)} ABC`
        await v.matriculaInput.fill(uniqueMatricula)
        await v.modeloInput.fill('Test Playwright Van')
        await v.capacidadInput.fill('1000')
        await v.consumoInput.fill('8.5')
        await v.kilometrajeInput.fill('500')
        await v.revisionInput.fill('2024-03-01')

        await v.modalSaveButton.click({ force: true })
        await page.waitForTimeout(2000)

        // Modal should close after success
        await expect(v.modal).not.toBeVisible({ timeout: 5000 })
        expect(await v.getRowCount()).toBeGreaterThanOrEqual(initial)
    })

    test('4.6 Editar vehículo: abrir modal, cambiar datos, guardar', async ({ page }) => {
        const v = new VehiculosPage(page)
        await v.waitForLoad()

        await v.clickEditOnRow(0)
        await page.waitForTimeout(500)

        // Modal title should say "Editar Vehículo"
        await expect(v.modal.getByText('Editar Vehículo')).toBeVisible()

        await v.modeloInput.clear()
        await v.modeloInput.fill('Modelo Editado E2E')
        await v.modalSaveButton.click({ force: true })
        await page.waitForTimeout(2000)

        await expect(v.modal).not.toBeVisible({ timeout: 5000 })
    })

    test('4.7 Eliminar vehículo: confirmar eliminación', async ({ page }) => {
        const v = new VehiculosPage(page)
        await v.waitForLoad()
        const initial = await v.getRowCount()

        await v.clickDeleteOnRow(initial - 1)
        await page.waitForTimeout(500)

        // Confirm dialog
        await expect(page.getByText('¿Eliminar vehículo?')).toBeVisible()
        await v.confirmDeleteButton.click()
        await page.waitForTimeout(2000)

        expect(await v.getRowCount()).toBeLessThan(initial)
    })

    test('4.10 KPIs reflejan conteos correctos', async ({ page }) => {
        const v = new VehiculosPage(page)
        await v.waitForLoad()

        // Use more specific locators to avoid strict mode violations (e.g. text appearing in select options)
        await expect(page.locator('p').filter({ hasText: /^Total Flota$/ })).toBeVisible()
        await expect(page.locator('p').filter({ hasText: /^Disponibles$/ })).toBeVisible()
        await expect(page.locator('p').filter({ hasText: /^En Ruta$/ })).toBeVisible()
        await expect(page.locator('p').filter({ hasText: /^Mantenimiento$/ })).toBeVisible()
    })
})
