import { chromium, type Browser, type Page } from 'playwright'
import { mkdirSync } from 'fs'
import { resolve } from 'path'
import AnsiToHtml from 'ansi-to-html'

//#region ANSI Converter
const converter = new AnsiToHtml({
	fg: '#cdd6f4',
	bg: '#1e1e2e',
	colors: {
		0: '#45475a',
		1: '#f38ba8',
		2: '#a6e3a1',
		3: '#f9e2af',
		4: '#89b4fa',
		5: '#f5c2e7',
		6: '#94e2d5',
		7: '#bac2de',
		8: '#585b70',
		9: '#f38ba8',
		10: '#a6e3a1',
		11: '#f9e2af',
		12: '#89b4fa',
		13: '#f5c2e7',
		14: '#94e2d5',
		15: '#a6adc8',
	},
})
//#endregion ANSI Converter

//#region HTML Template
function wrapInHtml(ansiHtml: string): string {
	return `<!DOCTYPE html>
<html>
<head>
<style>
* { margin: 0; padding: 0; box-sizing: border-box; }
body {
	background: #181825;
	display: flex;
	justify-content: center;
	align-items: center;
	min-height: 100vh;
	padding: 20px;
}
.terminal {
	background: #1e1e2e;
	border-radius: 10px;
	overflow: hidden;
	box-shadow: 0 8px 32px rgba(0,0,0,0.5);
	border: 1px solid #313244;
}
.terminal-chrome {
	background: #313244;
	padding: 8px 12px;
	display: flex;
	gap: 6px;
	align-items: center;
}
.dot { width: 12px; height: 12px; border-radius: 50%; }
.dot-red { background: #f38ba8; }
.dot-yellow { background: #f9e2af; }
.dot-green { background: #a6e3a1; }
.terminal-content {
	padding: 16px;
	font-family: 'JetBrains Mono', 'Fira Code', 'SF Mono', 'Cascadia Code', 'Consolas', monospace;
	font-size: 14px;
	line-height: 1.4;
	color: #cdd6f4;
	white-space: pre;
	overflow: hidden;
}
</style>
</head>
<body>
<div class="terminal">
	<div class="terminal-chrome">
		<div class="dot dot-red"></div>
		<div class="dot dot-yellow"></div>
		<div class="dot dot-green"></div>
	</div>
	<div class="terminal-content">${ansiHtml}</div>
</div>
</body>
</html>`
}
//#endregion HTML Template

//#region Screenshot Manager
let browser: Browser | null = null
let page: Page | null = null

export async function initBrowser(): Promise<void> {
	browser = await chromium.launch({ headless: true })
	page = await browser.newPage({ viewport: { width: 900, height: 600 } })
}

export async function closeBrowser(): Promise<void> {
	if (page) await page.close()
	if (browser) await browser.close()
	page = null
	browser = null
}

const SCREENSHOTS_DIR = resolve(__dirname, '../__screenshots__')

export async function captureScreenshot(
	ansiFrame: string,
	appName: string,
	screenName: string
): Promise<string> {
	if (!page)
		throw new Error('Browser not initialized. Call initBrowser() first.')

	// Convert ANSI to HTML
	const ansiHtml = converter.toHtml(ansiFrame)
	const html = wrapInHtml(ansiHtml)

	// Render in browser
	await page.setContent(html, { waitUntil: 'networkidle' })

	// Resize viewport to fit terminal content
	const terminalBox = await page.locator('.terminal').boundingBox()
	if (terminalBox) {
		await page.setViewportSize({
			width: Math.ceil(terminalBox.width) + 40,
			height: Math.ceil(terminalBox.height) + 40,
		})
	}

	// Screenshot
	const outDir = resolve(SCREENSHOTS_DIR, appName)
	mkdirSync(outDir, { recursive: true })
	const outPath = resolve(outDir, `${screenName}.png`)

	await page.locator('.terminal').screenshot({ path: outPath })

	return outPath
}
//#endregion Screenshot Manager
