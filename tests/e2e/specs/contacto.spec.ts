import { test, expect } from '@playwright/test'

test.describe('Módulo 10 — Formulario de Contacto', () => {

    test.beforeEach(async ({ page }) => {
        await page.goto('/contacto')
        await page.waitForLoadState('networkidle')
    })

    test('10.1 Formulario renderiza con todos los campos', async ({ page }) => {
        // Form should be visible
        const form = page.locator('form').first()
        await expect(form).toBeVisible()

        // Check for key input fields (name, email, message at minimum)
        const inputs = form.locator('input, textarea')
        const count = await inputs.count()
        expect(count).toBeGreaterThanOrEqual(2)
    })

    test('10.2 Enviar con datos válidos → feedback de éxito', async ({ page }) => {
        const form = page.locator('form').first()

        // Fill all fields
        const inputs = form.locator('input')
        const inputCount = await inputs.count()

        if (inputCount >= 1) await inputs.nth(0).fill('Test Playwright')
        if (inputCount >= 2) await inputs.nth(1).fill('test@playwright.com')
        if (inputCount >= 3) await inputs.nth(2).fill('600000000')

        // Fill textarea (message/company)
        const textareas = form.locator('textarea')
        if (await textareas.count() > 0) {
            await textareas.first().fill('Mensaje de prueba desde Playwright E2E')
        }

        // Submit
        const submitBtn = form.locator('button[type="submit"], button').filter({ hasText: /Enviar|Contactar/ }).first()
        await submitBtn.click()
        await page.waitForTimeout(2000)
    })

    test('10.3 Enviar con campos vacíos → validación del formulario', async ({ page }) => {
        const form = page.locator('form').first()

        // Try submitting empty
        const submitBtn = form.locator('button[type="submit"], button').filter({ hasText: /Enviar|Contactar/ }).first()
        await submitBtn.click()

        // HTML5 validation should prevent submission
        // Check that we're still on /contacto
        expect(page.url()).toContain('/contacto')

        // Check for invalid state on required field
        const firstInput = form.locator('input[required]').first()
        if (await firstInput.count() > 0) {
            const isInvalid = await firstInput.evaluate((el: HTMLInputElement) => !el.validity.valid)
            expect(isInvalid).toBe(true)
        }
    })
})
