import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { createApp, type AppInstance } from '../utils/harness'
import {
	initBrowser,
	closeBrowser,
	captureScreenshot,
} from '../utils/screenshot'
import { KEYS } from '../utils/keys'
import stripAnsiMod from 'strip-ansi'

const stripAnsi = (stripAnsiMod as any).default ?? stripAnsiMod

const APP_NAME = 'react-invaders'

describe(APP_NAME, () => {
	let app: AppInstance

	beforeAll(async () => {
		await initBrowser()
		app = await createApp('react')
		await app.delay(500)
	})

	afterAll(async () => {
		app?.unmount()
		await closeBrowser()
	})

	//#region Menu Screen
	it('captures menu screen', async () => {
		const frame = app.getFrame()
		const plain = stripAnsi(frame)

		expect(plain).toContain('Start Game')

		await captureScreenshot(frame, APP_NAME, 'menu')
	})
	//#endregion Menu Screen

	//#region Help Screen
	it('captures help screen', async () => {
		// Navigate: Down×3 + Enter
		await app.sendKeys([KEYS.DOWN, KEYS.DOWN, KEYS.DOWN, KEYS.ENTER])
		await app.delay(300)

		const frame = app.getFrame()
		await captureScreenshot(frame, APP_NAME, 'help')
	})
	//#endregion Help Screen

	//#region Settings Screen
	it('captures settings screen', async () => {
		// Back to menu, then navigate to Settings
		app.sendKey(KEYS.ESCAPE)
		await app.delay(300)
		await app.sendKeys([KEYS.DOWN, KEYS.DOWN, KEYS.ENTER])
		await app.delay(300)

		const frame = app.getFrame()
		await captureScreenshot(frame, APP_NAME, 'settings')
	})
	//#endregion Settings Screen

	//#region High Scores Screen
	it('captures high scores screen', async () => {
		app.sendKey(KEYS.ESCAPE)
		await app.delay(300)
		await app.sendKeys([KEYS.DOWN, KEYS.ENTER])
		await app.delay(300)

		const frame = app.getFrame()
		await captureScreenshot(frame, APP_NAME, 'high-scores')
	})
	//#endregion High Scores Screen

	//#region Game Screen
	it('captures game screen', async () => {
		// Return to menu from high scores
		app.sendKey(KEYS.ESCAPE)
		await app.delay(1000)
		// Select Start Game (first option, cursor resets)
		app.sendKey(KEYS.ENTER)
		await app.delay(2000)

		const frame = app.getFrame()
		const plain = stripAnsi(frame)

		expect(plain).toContain('SCORE')

		await captureScreenshot(frame, APP_NAME, 'game')
	})
	//#endregion Game Screen
})
