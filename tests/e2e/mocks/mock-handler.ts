import { Page } from '@playwright/test';
import { MOCK_DATA } from './mock-data';

// Helper to create a fake JWT token that `parseJwt` can decode
function createFakeJwt(role: string, email: string) {
    const header = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }));
    const payload = btoa(JSON.stringify({
        sub: "1",
        email: email,
        "http://schemas.microsoft.com/ws/2008/06/identity/claims/role": role,
        name: "Mock User"
    }));
    return `${header}.${payload}.fakesignature`;
}

export async function setupMocks(page: Page) {
    // Auth - Hybrid Strategy: Intercept login and return MOCK auth based on payload credentials
    await page.route('**/api/Auth/iniciar-sesion', async (route, request) => {
        try {
            const postData = JSON.parse(request.postData() || '{}');

            // Check for Repartidor credentials
            if (postData.email === 'a@gmail.com') {
                await route.fulfill({
                    status: 200,
                    contentType: 'application/json',
                    body: JSON.stringify({
                        tokenDeAcceso: createFakeJwt('REPARTIDOR', 'a@gmail.com'),
                        usuario: { ...MOCK_DATA.auth.user, id: 2, email: 'a@gmail.com', rol: 'REPARTIDOR' }
                    })
                });
                return;
            }

            // Check for Admin credentials (from env or fallback)
            const adminEmail = process.env.ADMIN_EMAIL || 'b@gmail.com';
            const adminPassword = process.env.ADMIN_PASSWORD || '1234';

            if (postData.email === adminEmail && postData.password === adminPassword) {
                await route.fulfill({
                    status: 200,
                    contentType: 'application/json',
                    body: JSON.stringify({
                        tokenDeAcceso: createFakeJwt('ADMIN', adminEmail),
                        usuario: MOCK_DATA.auth.user
                    })
                });
                return;
            }

            // If neither matches, return 401 Unauthorized
            await route.fulfill({
                status: 401,
                contentType: 'application/json',
                body: JSON.stringify({ mensaje: 'Credenciales inválidas' })
            });

        } catch (e) {
            // Fallback for unexpected payloads
            await route.fulfill({ status: 400, body: 'Bad Request' });
        }
    });

    // Logout endpoint
    await page.route('**/api/Auth/cerrar-sesion', async (route) => {
        await route.fulfill({ status: 200 });
    });

    // CRUD Operations (List)
    await page.route('**/api/Vehiculos', async (route, request) => {
        if (request.method() === 'GET') {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify(MOCK_DATA.vehiculos)
            });
        }
    });

    // Specific GET by ID for editing
    await page.route('**/api/Vehiculos/*', async (route, request) => {
        if (request.method() === 'GET') {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify(MOCK_DATA.vehiculos[0]) // Always return the first mock vehicle
            });
        } else {
            route.fallback();
        }
    });

    // Profile/Me endpoint
    await page.route('**/api/Usuarios/me', async (route) => {
        await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify(MOCK_DATA.auth.user)
        });
    });

    // Define standard CRUD generic interception logic
    const endpoints = [
        { path: 'Vehiculos', data: MOCK_DATA.vehiculos },
        { path: 'Ruta', data: MOCK_DATA.rutas },
        { path: 'Entregas', data: MOCK_DATA.entregas },
        { path: 'Usuarios', data: MOCK_DATA.usuarios },
        { path: 'Clientes', data: MOCK_DATA.clientes },
    ];

    for (const endpoint of endpoints) {
        // Base route (GET all or POST create)
        await page.route(`**/api/${endpoint.path}**`, async (route, request) => {
            // Ignore /estadisticas paths here as they are handled separately, but we can just use exact matching for collection
            const url = request.url();

            // Bypass specific sub-routes if needed, or handle them specially
            if (url.includes('estadisticas') && endpoint.path === 'Ruta') return route.continue();
            if (url.includes('estadisticas') && endpoint.path === 'Entregas') return route.continue();

            if (request.method() === 'GET' && !url.match(/\/\d+$/)) {
                // GET List
                await route.fulfill({
                    status: 200,
                    contentType: 'application/json',
                    body: JSON.stringify(endpoint.data)
                });
            } else if (request.method() === 'GET' && url.match(/\/\d+$/)) {
                // GET by ID
                await route.fulfill({
                    status: 200,
                    contentType: 'application/json',
                    body: JSON.stringify(endpoint.data[0] || {})
                });
            } else if (request.method() === 'POST') {
                // Create
                await route.fulfill({
                    status: 200, // or 201
                    contentType: 'application/json',
                    body: JSON.stringify(endpoint.data[0] || {})
                });
            } else if (request.method() === 'PUT' || request.method() === 'PATCH') {
                // Update
                await route.fulfill({
                    status: 200,
                    contentType: 'application/json',
                    body: JSON.stringify(endpoint.data[0] || {})
                });
            } else if (request.method() === 'DELETE') {
                // Delete
                await route.fulfill({ status: 200 }); // some APIs return 204 or just 200 empty
            } else {
                await route.continue();
            }
        });
    }

    // Dashboard Statistics Interceptors
    await page.route('**/api/Estadisticas/global', async (route) => {
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(MOCK_DATA.estadisticasGlobal) });
    });

    await page.route('**/api/Ruta/estadisticas', async (route) => {
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(MOCK_DATA.estadisticasRutas) });
    });

    await page.route('**/api/Notificaciones*', async (route) => {
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) });
    });

    await page.route('**/api/Mantenimientos*', async (route) => {
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) });
    });

    await page.route('**/api/EstadoSesion/activos*', async (route) => {
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) });
    });
}
