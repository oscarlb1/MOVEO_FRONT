const { execSync } = require('child_process');
process.env.CI = '1';
try {
    execSync('npx playwright test tests/e2e/specs/auth.spec.ts -g "Login con credenciales admin válidas" --project=chromium', { stdio: 'inherit' });
} catch (e) {
    process.exit(1);
}
