# MOVEO E2E Testing Suite (Playwright)

Este directorio contiene la suite completa de pruebas de extremo a extremo (E2E) para la aplicación MOVEO. La suite está diseñada para ser ultra-estable y capaz de ejecutarse en entornos de Integración Continua (CI) sin depender de un backend real.

## 🏗️ Arquitectura de Mocks

Para garantizar la estabilidad en CI y un desarrollo desacoplado, utilizamos una estrategia de **API Mocking** completa:

- **`tests/e2e/utils/mock-handler.ts`**: Es el cerebro de la interceptación. Utiliza `page.route` de Playwright para capturar todas las llamadas a `/api/**`.
- **Estrategia Híbrida de Auth**: El mock intercepta el login y genera un JWT falso decodificable por el frontend. Permite simular diferentes roles (ADMIN, REPARTIDOR) basándose en el email proporcionado.
- **Intercepción CRUD**: Las peticiones GET, POST, PUT y DELETE se interceptan para devolver datos estáticos o confirmar el éxito de la operación, asegurando que la UI reaccione correctamente.

## 📁 Estructura de Carpetas

```text
tests/e2e/
├── fixtures/          # Extensiones de Playwright (Auth, Mocks auto-activados)
│   └── auth.fixture.ts
├── mocks/             # Datos estáticos e interceptores para la simulación
│   ├── mock-data.ts
│   └── mock-handler.ts
├── pages/             # Page Object Models (POM) - Selectores y lógica de página
│   ├── LoginPage.ts
│   ├── VehiculosPage.ts
│   └── ...
├── specs/             # Los tests reales (.spec.ts)
│   ├── auth.spec.ts
│   ├── vehiculos.spec.ts
│   └── ...
└── utils/             # Utilidades genéricas (ej: helpers de tiempo)
```

## 🚀 Comandos de Ejecución

### Ejecución Local (Con Backend Real)
Si tienes el backend corriendo, puedes ejecutar los tests normalmente:
```bash
npx playwright test
```

### Ejecución en Modo Mock (Simulación CI)
Para probar los tests utilizando los mocks locales (como lo haría GitHub Actions):
```bash
# Windows (PowerShell)
$env:CI="1"; npx playwright test

# Windows (CMD)
set CI=1 && npx playwright test
```

### Otros Comandos Útiles
- `npm run test:e2e:ui`: Abre la interfaz interactiva de Playwright.
- `npm run test:e2e:report`: Abre el último reporte HTML generado tras un fallo.

## 🛠️ Mantenimiento

### Añadir nuevos datos
Si la API crece o necesitas probar nuevos escenarios, edita **`tests/e2e/mocks/mock-data.ts`**. Asegúrate de que los objetos sigan la estructura de los DTOs del frontend para evitar errores de renderizado.

### Actualizar Interceptores
Si añades un nuevo endpoint, regístralo en **`tests/e2e/utils/mock-handler.ts`** dentro de la función `setupMocks`.

---

## 🔑 Configuración de Secrets en GitHub

Para que el workflow de GitHub Actions funcione correctamente, debes configurar los siguientes **Secrets** en tu repositorio:

1. `ADMIN_EMAIL`: El correo del usuario de pruebas (ej: `admin@example.com`).
2. `ADMIN_PASSWORD`: La contraseña del usuario de pruebas.

> [!TIP]
> En CI, los tests detectarán la variable `CI=true` y activarán automáticamente los mocks, ignorando cualquier conexión externa necesaria.
