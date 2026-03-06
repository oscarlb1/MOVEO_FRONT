import { type Page, type Locator } from '@playwright/test'

export class VehiculosPage {
    readonly page: Page
    readonly searchInput: Locator
    readonly filterSelect: Locator
    readonly newVehicleButton: Locator
    readonly exportPDFButton: Locator
    readonly exportExcelButton: Locator
    readonly tableRows: Locator
    readonly modal: Locator
    readonly matriculaInput: Locator
    readonly modeloInput: Locator
    readonly estadoSelect: Locator
    readonly capacidadInput: Locator
    readonly consumoInput: Locator
    readonly kilometrajeInput: Locator
    readonly revisionInput: Locator
    readonly modalSaveButton: Locator
    readonly modalCancelButton: Locator
    readonly confirmDeleteButton: Locator

    constructor(page: Page) {
        this.page = page
        this.searchInput = page.locator('input[placeholder="Buscar por matrícula o modelo..."]')
        this.filterSelect = page.locator('select').filter({ hasText: 'Todos los estados' })
        this.newVehicleButton = page.getByText('Nuevo Vehículo', { exact: true })
        this.exportPDFButton = page.locator('button[title="Exportar Vehículos PDF"]')
        this.exportExcelButton = page.locator('button[title="Exportar Vehículos Excel"]')
        this.tableRows = page.locator('table tbody tr')
        this.modal = page.locator('.fixed.inset-0.z-50')
        this.matriculaInput = page.locator('#vehiculo-matricula')
        this.modeloInput = page.locator('#vehiculo-modelo')
        this.estadoSelect = page.locator('#vehiculo-estado')
        this.capacidadInput = page.locator('#vehiculo-capacidad')
        this.consumoInput = page.locator('#vehiculo-consumo')
        this.kilometrajeInput = page.locator('#vehiculo-kilometraje')
        this.revisionInput = page.locator('#vehiculo-revision')
        this.modalSaveButton = page.locator('#modal-save-button')
        this.modalCancelButton = page.locator('#modal-cancel-button')
        this.confirmDeleteButton = page.locator('#confirm-delete-button')
    }

    /** Helper to dismiss cookies specifically within this view context */
    async handleCookies() {
        try {
            const banner = this.page.getByText(/aceptar todas/i)
            if (await banner.isVisible({ timeout: 2000 })) {
                await banner.click({ force: true, timeout: 2000 })
                await this.page.waitForTimeout(500)
            }
        } catch (e) {
            console.log('Cookie banner not found in Vehiculos view, continuing...');
        }
    }

    async waitForLoad() {
        await this.page.waitForFunction(() =>
            document.querySelectorAll('.animate-pulse').length === 0,
            { timeout: 15000 }
        )
        await this.page.waitForTimeout(500)
    }

    async getRowCount(): Promise<number> {
        return this.tableRows.count()
    }

    /** Click the Pencil (edit) button on a row */
    async clickEditOnRow(index: number) {
        const row = this.tableRows.nth(index)
        await row.locator('button[title="Editar"]').click()
    }

    /** Click the Trash (delete) button on a row */
    async clickDeleteOnRow(index: number) {
        const row = this.tableRows.nth(index)
        await row.locator('button[title="Eliminar"]').click()
    }
}
