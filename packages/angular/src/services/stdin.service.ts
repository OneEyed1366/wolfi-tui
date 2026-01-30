import { Injectable, inject, DestroyRef, NgZone } from '@angular/core'
import { parseKeypress, nonAlphanumericKeys } from '@wolfie/core'
import { STDIN_CONTEXT } from '../tokens'

//#region Types
export type Key = {
	upArrow: boolean
	downArrow: boolean
	leftArrow: boolean
	rightArrow: boolean
	pageDown: boolean
	pageUp: boolean
	home: boolean
	end: boolean
	return: boolean
	escape: boolean
	ctrl: boolean
	shift: boolean
	tab: boolean
	backspace: boolean
	delete: boolean
	meta: boolean
}

export type InputHandler = (input: string, key: Key) => void

export interface InputOptions {
	isActive?: () => boolean
}
//#endregion Types

//#region StdinService
@Injectable()
export class StdinService {
	private context = inject(STDIN_CONTEXT)

	get stdin(): NodeJS.ReadStream {
		return this.context.stdin
	}

	get isRawModeSupported(): boolean {
		return this.context.isRawModeSupported
	}

	setRawMode(value: boolean): void {
		this.context.setRawMode(value)
	}

	get internal_exitOnCtrlC(): boolean {
		return this.context.internal_exitOnCtrlC
	}

	get internal_eventEmitter() {
		return this.context.internal_eventEmitter
	}
}
//#endregion StdinService

//#region injectInput
/**
 * Signal-based input handling for Angular components
 * Mirrors React's useInput and Vue's useInput patterns
 *
 * @example
 * ```typescript
 * export class MyComponent {
 *   private isActive = signal(true)
 *
 *   constructor() {
 *     injectInput((input, key) => {
 *       if (key.return) {
 *         console.log('Enter pressed')
 *       }
 *     }, { isActive: () => this.isActive() })
 *   }
 * }
 * ```
 */
export function injectInput(
	handler: InputHandler,
	options: InputOptions = {}
): void {
	const stdinContext = inject(STDIN_CONTEXT)
	const destroyRef = inject(DestroyRef)
	const ngZone = inject(NgZone)

	const handleData = (data: string) => {
		// Check isActive if provided
		if (options.isActive && !options.isActive()) {
			return
		}

		const keypress = parseKeypress(data)

		const key: Key = {
			upArrow: keypress.name === 'up',
			downArrow: keypress.name === 'down',
			leftArrow: keypress.name === 'left',
			rightArrow: keypress.name === 'right',
			pageDown: keypress.name === 'pagedown',
			pageUp: keypress.name === 'pageup',
			home: keypress.name === 'home',
			end: keypress.name === 'end',
			return: keypress.name === 'return',
			escape: keypress.name === 'escape',
			ctrl: keypress.ctrl,
			shift: keypress.shift,
			tab: keypress.name === 'tab',
			backspace: keypress.name === 'backspace',
			delete: keypress.name === 'delete',
			meta: keypress.meta || keypress.name === 'escape' || keypress.option,
		}

		let input = keypress.ctrl ? keypress.name : keypress.sequence

		if (nonAlphanumericKeys.includes(keypress.name)) {
			input = ''
		}

		if (input.startsWith('\u001B')) {
			input = input.slice(1)
		}

		if (
			input.length === 1 &&
			typeof input[0] === 'string' &&
			/[A-Z]/.test(input[0])
		) {
			key.shift = true
		}

		// Handle Ctrl+C exit if enabled
		if (!(input === 'c' && key.ctrl) || !stdinContext.internal_exitOnCtrlC) {
			// Run inside Angular zone to trigger change detection
			ngZone.run(() => handler(input, key))
		}
	}

	// Enable raw mode immediately (without using effect)
	stdinContext.setRawMode(true)

	// Subscribe to input events
	stdinContext.internal_eventEmitter.on('input', handleData)

	// Cleanup on destroy
	destroyRef.onDestroy(() => {
		stdinContext.internal_eventEmitter.off('input', handleData)
		stdinContext.setRawMode(false)
	})
}
//#endregion injectInput
