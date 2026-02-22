// WHY: NgZone constructor (used inside renderWolfie) throws NG0908 if zone.js
// is not loaded first. Must be the very first import.
import 'zone.js'
// WHY: JIT template compilation requires @angular/compiler to be registered
// before createComponent() is called. Without it, Angular throws
// "JIT compiler unavailable" — masking the actual NullInjectorError under test.
import '@angular/compiler'

import { Component, inject } from '@angular/core'
import { EventEmitter } from 'node:events'
import { describe, it, afterEach } from 'vitest'
import type { WolfieInstance } from '../../src/bootstrap'
import { renderWolfie } from '../../src/bootstrap'
import { THEME_CONTEXT } from '../../src/theme'

//#region Minimal test component

// A component that only injects THEME_CONTEXT — same as AlertComponent,
// BadgeComponent, ProgressBarComponent, but with no imports/template
// to avoid chained JIT compilation of BoxComponent/TextComponent.
@Component({
	selector: 'test-theme-aware',
	standalone: true,
	template: '',
})
class ThemeAwareComponent {
	// This inject() call runs during createComponent() — before any template
	// is rendered. If THEME_CONTEXT is absent from the injector, this line
	// throws: NullInjectorError: No provider for InjectionToken WolfieTheme.
	readonly theme = inject(THEME_CONTEXT)
}

//#endregion

//#region Fake streams (same shape as verify.cjs harness)

function createFakeStdout() {
	return Object.assign(new EventEmitter(), {
		columns: 80,
		rows: 24,
		write: () => true,
	})
}

function createFakeStdin() {
	return Object.assign(new EventEmitter(), {
		isTTY: true,
		setRawMode: () => {},
		setEncoding: () => {},
		read: () => null,
		unref: () => {},
		ref: () => {},
	})
}

//#endregion

describe('renderWolfie — THEME_CONTEXT injection regression', () => {
	let instance: WolfieInstance | undefined

	afterEach(() => {
		instance?.unmount()
		instance = undefined
	})

	it('bootstraps a theme-aware component without NullInjectorError (regression: WolfieTheme)', async () => {
		// REGRESSION: renderWolfie used createEnvironmentInjector(providers, null).
		// With a null parent, Angular cannot walk up to an ApplicationRef to resolve
		// tokens declared with `providedIn: 'root'`, so THEME_CONTEXT — which
		// AlertComponent, BadgeComponent and ProgressBarComponent all inject() —
		// was unresolvable.
		//
		// RED before fix: renderWolfie(ThemeAwareComponent) rejects with
		//   NullInjectorError: No provider for InjectionToken WolfieTheme
		// GREEN after fix: THEME_CONTEXT is explicitly listed in renderWolfie's
		//   providers → inject(THEME_CONTEXT) resolves → no error

		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		instance = await renderWolfie(ThemeAwareComponent as any, {
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			stdout: createFakeStdout() as any,
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			stdin: createFakeStdin() as any,
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			stderr: createFakeStdout() as any,
			exitOnCtrlC: false,
		})
	})
})
