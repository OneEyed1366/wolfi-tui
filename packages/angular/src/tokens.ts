import { InjectionToken } from '@angular/core'
import type { EventEmitter } from 'node:events'

//#region Stdin Context
export interface StdinContext {
	stdin: NodeJS.ReadStream
	setRawMode: (value: boolean) => void
	isRawModeSupported: boolean
	internal_exitOnCtrlC: boolean
	internal_eventEmitter: EventEmitter
	internal_triggerChangeDetection: () => void
}

export const STDIN_CONTEXT = new InjectionToken<StdinContext>(
	'WOLFIE_STDIN_CONTEXT'
)
//#endregion Stdin Context

//#region Stdout Context
export interface StdoutContext {
	stdout: NodeJS.WriteStream
	write: (data: string) => void
}

export const STDOUT_CONTEXT = new InjectionToken<StdoutContext>(
	'WOLFIE_STDOUT_CONTEXT'
)
//#endregion Stdout Context

//#region Stderr Context
export interface StderrContext {
	stderr: NodeJS.WriteStream
	write: (data: string) => void
}

export const STDERR_CONTEXT = new InjectionToken<StderrContext>(
	'WOLFIE_STDERR_CONTEXT'
)
//#endregion Stderr Context

//#region App Context
export interface AppContext {
	exit: (error?: Error) => void
}

export const APP_CONTEXT = new InjectionToken<AppContext>('WOLFIE_APP_CONTEXT')
//#endregion App Context

//#region Accessibility Context
export interface AccessibilityContext {
	isScreenReaderEnabled: boolean
}

export const ACCESSIBILITY_CONTEXT = new InjectionToken<AccessibilityContext>(
	'WOLFIE_ACCESSIBILITY_CONTEXT'
)
//#endregion Accessibility Context

//#region Background Context
export interface BackgroundContext {
	backgroundColor: string | undefined
}

export const BACKGROUND_CONTEXT = new InjectionToken<BackgroundContext>(
	'WOLFIE_BACKGROUND_CONTEXT'
)
//#endregion Background Context

//#region Focus Context
export interface Focusable {
	id: string
	isActive: boolean
}

export interface FocusContext {
	activeId: string | undefined
	addFocusable: (id: string, options?: { autoFocus?: boolean }) => void
	removeFocusable: (id: string) => void
	activateFocusable: (id: string) => void
	deactivateFocusable: (id: string) => void
	focusNext: () => void
	focusPrevious: () => void
	focus: (id: string) => void
	enableFocus: () => void
	disableFocus: () => void
}

export const FOCUS_CONTEXT = new InjectionToken<FocusContext>(
	'WOLFIE_FOCUS_CONTEXT'
)
//#endregion Focus Context

//#region Wolfie Instance
export const WOLFIE_INSTANCE = new InjectionToken<any>('WOLFIE_INSTANCE')
//#endregion Wolfie Instance
