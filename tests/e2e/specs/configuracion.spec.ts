import { test, expect } from '../fixtures/auth.fixture'
import { LoginPage } from '../pages/LoginPage'
import { ADMIN_CREDENTIALS } from '../fixtures/auth.fixture'

test.describe('Módulo 9 — Configuración', () => {

    test.beforeEach(async ({ adminPage, page }) => {
        // adminPage already logs in and handles cookies
        await page.goto('/configuracion')
        await page.waitForLoadState('networkidle')
    })

    test('9.1 Página de configuración carga con datos del usuario', async ({ page }) => {
        // The page should have loaded with profile info
        const inputs = page.locator('input')
        const count = await inputs.count()
        expect(count).toBeGreaterThan(0)
    })

    test('9.2 Formulario de perfil contiene campos editables', async ({ page }) => {
        // Wait for profile data to load (important because it fetches from backend)
        await page.waitForSelector('#perfil-nombre', { state: 'visible', timeout: 10000 });

        const nameInput = page.locator('#perfil-nombre');
        const value = await nameInput.inputValue();
        expect(value.length).toBeGreaterThan(0);

        await expect(page.locator('#perfil-email')).toBeDisabled();
        await expect(page.locator('#perfil-telefono')).toBeVisible();
    });

    test('9.5 Navegar de vuelta al dashboard', async ({ page }) => {
        // Click back/logo link or use browser back
        await page.goBack()
        await page.waitForURL('**/dashboard', { timeout: 5000 })
        expect(page.url()).toContain('/dashboard')
    })
})
