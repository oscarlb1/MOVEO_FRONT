import { test, expect } from '../fixtures/auth.fixture'
import { LoginPage } from '../pages/LoginPage'
import { DashboardPage } from '../pages/DashboardPage'
import { ADMIN_CREDENTIALS, REPARTIDOR_CREDENTIALS } from '../fixtures/auth.fixture'

test.describe('Módulo 1 — Autenticación y Sesión', () => {

    // ─── HAPPY PATH ───────────────────────────────────────────

    test('1.1 Login con credenciales admin válidas → redirige a /dashboard', async ({ loginPage }) => {
        await loginPage.login(ADMIN_CREDENTIALS.email, ADMIN_CREDENTIALS.password)

        // Should navigate away from /login
        await loginPage.page.waitForURL('**/dashboard', { timeout: 10000 })
        expect(loginPage.page.url()).toContain('/dashboard')

        // Dashboard sidebar should be visible
        const dashboard = new DashboardPage(loginPage.page)
        await expect(dashboard.sidebar).toBeVisible()
    })

    test('1.7 Logout desde sidebar del dashboard → token eliminado, redirige a /login', async ({ loginPage }) => {
        // First login
        await loginPage.loginAndWait(ADMIN_CREDENTIALS.email, ADMIN_CREDENTIALS.password)

        // Now logout
        const dashboard = new DashboardPage(loginPage.page)
        await dashboard.logout()

        // Should redirect to login
        await loginPage.page.waitForURL('**/login', { timeout: 10000 })
        expect(loginPage.page.url()).toContain('/login')

        // Token should be removed
        const token = await loginPage.page.evaluate(() => localStorage.getItem('token'))
        expect(token).toBeNull()
    })

    // ─── ERROR CASES ──────────────────────────────────────────

    test('1.2 Login con credenciales inválidas → toast de error', async ({ loginPage }) => {
        await loginPage.login('fake@email.com', 'wrongpassword')

        // Wait for toast to appear
        const toast = loginPage.page.locator('[data-sonner-toast]').first()
        await expect(toast).toBeVisible({ timeout: 8000 })

        // Check toast contains error message
        await expect(toast).toContainText('Error de acceso')
    })

    test('1.3 Login con campos vacíos → formulario no se envía (validación HTML)', async ({ loginPage }) => {
        // Click submit without filling anything
        await loginPage.submitButton.click()

        // Should still be on /login (form validation prevents submit)
        expect(loginPage.page.url()).toContain('/login')

        // Email input should have :invalid pseudo-class (HTML5 required validation)
        const isEmailInvalid = await loginPage.emailInput.evaluate((el: HTMLInputElement) => !el.validity.valid)
        expect(isEmailInvalid).toBe(true)
    })

    test('1.4 Login con usuario REPARTIDOR → toast "Acceso denegado"', async ({ loginPage }) => {
        await loginPage.login(REPARTIDOR_CREDENTIALS.email, REPARTIDOR_CREDENTIALS.password)

        // Wait for the "Acceso denegado" toast
        const toast = loginPage.page.locator('[data-sonner-toast]').first()
        await expect(toast).toBeVisible({ timeout: 8000 })
        await expect(toast).toContainText('Acceso denegado')

        // Should still be on /login (user was logged out server-side)
        expect(loginPage.page.url()).toContain('/login')
    })

    // ─── NAVIGATION GUARDS ────────────────────────────────────

    test('1.5 Usuario autenticado visita /login → redirige a /dashboard', async ({ page }) => {
        // First, login normally
        const loginPage = new LoginPage(page)
        await loginPage.goto()
        await loginPage.loginAndWait(ADMIN_CREDENTIALS.email, ADMIN_CREDENTIALS.password)

        // Now try to go to /login
        await page.goto('/login')

        // Guard should redirect to /dashboard
        await page.waitForURL('**/dashboard', { timeout: 5000 })
        expect(page.url()).toContain('/dashboard')
    })

    test('1.6 Usuario no autenticado visita /configuracion → redirige a /login', async ({ page }) => {
        // Try to access protected route without logging in
        await page.goto('/configuracion')

        // Should be redirected to /login
        await page.waitForURL('**/login', { timeout: 5000 })
        expect(page.url()).toContain('/login')
    })

    // ─── NAVIGATION ───────────────────────────────────────────

    test('1.8 Click en logo Moveo desde login → navega a /', async ({ loginPage }) => {
        await loginPage.moveoLogo.click()

        await loginPage.page.waitForURL(/^\/$|\/$/, { timeout: 5000 })
        // Should be on the home page
        const url = loginPage.page.url()
        expect(url.endsWith('/') || url.endsWith(':5173')).toBe(true)
    })

    // ─── PERSISTENCE ──────────────────────────────────────────

    test('1.9 Sesión persiste tras recargar página (token en localStorage)', async ({ page }) => {
        // Login first
        const loginPage = new LoginPage(page)
        await loginPage.goto()
        await loginPage.loginAndWait(ADMIN_CREDENTIALS.email, ADMIN_CREDENTIALS.password)

        // Verify token exists
        const tokenBefore = await page.evaluate(() => localStorage.getItem('token'))
        expect(tokenBefore).toBeTruthy()

        // Reload the page
        await page.reload()
        await page.waitForLoadState('networkidle')

        // Token should still be there
        const tokenAfter = await page.evaluate(() => localStorage.getItem('token'))
        expect(tokenAfter).toBe(tokenBefore)

        // Should still be on dashboard
        expect(page.url()).toContain('/dashboard')
    })
})
