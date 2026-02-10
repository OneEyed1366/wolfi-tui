import type { Type, Provider, EnvironmentInjector } from '@angular/core'
import {
	createComponent,
	NgZone,
	RendererFactory2,
	createEnvironmentInjector,
	ɵChangeDetectionScheduler as ChangeDetectionScheduler,
} from '@angular/core'

//#region WolfieChangeDetectionScheduler
/**
 * Microtask-batched ChangeDetectionScheduler for signal reactivity.
 * Angular calls notify() whenever a signal read in a template changes.
 * We batch these into a single detectChanges() per microtask to keep
 * signal-driven state (setInterval ticks, setTimeout, etc.) reactive
 * without relying on zone.js-triggered CD.
 */
class WolfieChangeDetectionScheduler {
	private _detectChanges: (() => void) | null = null
	private _scheduled = false
	runningTick = false

	/** Wire up after componentRef is created */
	setDetectChanges(fn: () => void): void {
		this._detectChanges = fn
	}

	notify(_source?: number): void {
		if (this._scheduled || this.runningTick || !this._detectChanges) return
		this._scheduled = true
		queueMicrotask(() => {
			this._scheduled = false
			if (!this._detectChanges || this.runningTick) return
			this.runningTick = true
			try {
				this._detectChanges()
			} finally {
				this.runningTick = false
			}
		})
	}
}
//#endregion WolfieChangeDetectionScheduler
import cliCursor from 'cli-cursor'
import { WolfieAngular, type WolfieOptions } from './wolfie-angular'
import { WolfieRendererFactory } from './renderer/wolfie-renderer-factory'
import {
	STDIN_CONTEXT,
	STDOUT_CONTEXT,
	STDERR_CONTEXT,
	APP_CONTEXT,
	ACCESSIBILITY_CONTEXT,
	WOLFIE_INSTANCE,
} from './tokens'
import {
	StdinService,
	StdoutService,
	StderrService,
	AppService,
	FocusService,
} from './services'

//#region Types
export interface RenderOptions extends WolfieOptions {
	providers?: Provider[]
}

export interface WolfieInstance {
	unmount: () => void
	waitUntilExit: () => Promise<void>
	clear: () => void
	rerender: () => void
}
//#endregion Types

//#region renderWolfie
/**
 * Bootstrap an Angular component as a Wolfie TUI application
 *
 * @example
 * ```typescript
 * import { renderWolfie } from '@wolfie/angular'
 * import { AppComponent } from './app.component'
 *
 * const instance = renderWolfie(AppComponent, {
 *   exitOnCtrlC: true,
 * })
 *
 * await instance.waitUntilExit()
 * ```
 */
export async function renderWolfie<T>(
	component: Type<T>,
	options: RenderOptions = {}
): Promise<WolfieInstance> {
	// 1. Create WolfieAngular instance
	const wolfie = new WolfieAngular({
		stdout: options.stdout ?? process.stdout,
		stdin: options.stdin ?? process.stdin,
		stderr: options.stderr ?? process.stderr,
		maxFps: options.maxFps ?? 30,
		debug: options.debug ?? false,
		isScreenReaderEnabled: options.isScreenReaderEnabled,
		exitOnCtrlC: options.exitOnCtrlC ?? true,
	})

	// 2. Hide cursor
	cliCursor.hide(wolfie.stdout)

	// 3. Set up Ctrl+C handler if enabled
	if (wolfie.exitOnCtrlC) {
		wolfie.eventEmitter.on('input', (data: string) => {
			// Ctrl+C is \x03
			if (data === '\x03') {
				wolfie.exit()
			}
		})
	}

	// 4. Create NgZone and CD scheduler
	const ngZone = new NgZone({ enableLongStackTrace: false })
	const cdScheduler = new WolfieChangeDetectionScheduler()

	// 5. Create providers
	const providers: Provider[] = [
		{ provide: WOLFIE_INSTANCE, useValue: wolfie },
		{
			provide: STDIN_CONTEXT,
			useValue: {
				stdin: wolfie.stdin,
				setRawMode: wolfie.setRawMode,
				isRawModeSupported: wolfie.isRawModeSupported,
				internal_exitOnCtrlC: wolfie.exitOnCtrlC,
				internal_eventEmitter: wolfie.eventEmitter,
				// Placeholder - will be set after component creation
				internal_triggerChangeDetection: () => {},
			},
		},
		{
			provide: STDOUT_CONTEXT,
			useValue: {
				stdout: wolfie.stdout,
				write: (data: string) => wolfie.writeToStdout(data),
			},
		},
		{
			provide: STDERR_CONTEXT,
			useValue: {
				stderr: wolfie.stderr,
				write: (data: string) => wolfie.writeToStderr(data),
			},
		},
		{
			provide: APP_CONTEXT,
			useValue: {
				exit: (error?: Error) => wolfie.exit(error),
			},
		},
		{
			provide: ACCESSIBILITY_CONTEXT,
			useValue: {
				isScreenReaderEnabled: wolfie.isScreenReaderEnabled,
			},
		},
		{
			provide: RendererFactory2,
			useFactory: () => new WolfieRendererFactory(wolfie, ngZone),
		},
		{
			provide: NgZone,
			useValue: ngZone,
		},
		// Signal reactivity — schedules CD via microtask when signals change
		{
			provide: ChangeDetectionScheduler,
			useValue: cdScheduler,
		},
		StdinService,
		StdoutService,
		StderrService,
		AppService,
		FocusService,
		...(options.providers ?? []),
	]

	// 6. Create environment injector with minimal Angular infrastructure
	const injector = createEnvironmentInjector(
		providers,
		null as unknown as EnvironmentInjector
	)

	// 7. Create and bootstrap the component
	const componentRef = createComponent(component, {
		environmentInjector: injector,
		hostElement: wolfie.rootNode as unknown as Element,
	})

	// 8. Wire up CD scheduler so signal changes trigger detectChanges()
	const detectChanges = () => componentRef.changeDetectorRef.detectChanges()
	cdScheduler.setDetectChanges(detectChanges)

	// 9. Set up change detection trigger for input handling
	// This is stored in STDIN_CONTEXT and called after every input handler
	const stdinContext = injector.get(STDIN_CONTEXT)
	stdinContext.internal_triggerChangeDetection = detectChanges

	// 10. Trigger initial change detection to run lifecycle hooks
	componentRef.changeDetectorRef.detectChanges()

	// 10. Initial render
	wolfie.onRender()

	// 9. Return instance
	return {
		unmount: () => {
			cliCursor.show(wolfie.stdout)
			componentRef.destroy()
			wolfie.unmount()
		},
		waitUntilExit: () => wolfie.waitUntilExit(),
		clear: () => wolfie.clear(),
		rerender: () => wolfie.onRender(),
	}
}
//#endregion renderWolfie

//#region render (alias)
/**
 * Alias for renderWolfie for compatibility with Vue/React patterns
 */
export const render = renderWolfie
//#endregion render
