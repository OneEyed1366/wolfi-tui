import { execSync } from 'child_process'

export default async function globalSetup() {
	console.log('[e2e] Building all apps...')

	// Build all three apps in parallel
	execSync('pnpm -r --filter="./apps/*" build', {
		cwd: process.cwd(),
		stdio: 'inherit',
	})

	// Ensure Playwright chromium is available
	console.log('[e2e] Ensuring Playwright chromium...')
	execSync('npx playwright install chromium', {
		cwd: process.cwd(),
		stdio: 'inherit',
	})

	console.log('[e2e] Setup complete.')
}
