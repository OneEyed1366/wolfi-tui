import type { OnInit, OnDestroy } from '@angular/core'
import { Component, signal } from '@angular/core'
import { BoxComponent, TextComponent } from '@wolfie/angular'

//#region Constants
const SPINNER_FRAMES = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏']
const SPINNER_INTERVAL_MS = 80
const PROGRESS_INTERVAL_MS = 200
const PROGRESS_MAX = 10
//#endregion Constants

//#region StatusDemoComponent
@Component({
	selector: 'app-status-demo',
	standalone: true,
	imports: [BoxComponent, TextComponent],
	template: `
		<w-box class="flex-col w-full gap-1">
			<!-- Title -->
			<w-text class="font-bold text-white">Status Demo</w-text>

			<!-- Spinner -->
			<w-box class="flex-row gap-1">
				<w-text class="text-cyan">{{ spinnerFrame() }}</w-text>
				<w-text class="text-gray">Loading...</w-text>
			</w-box>

			<!-- Alert Boxes -->
			<w-box class="flex-col gap-1 mt-1">
				<!-- Success -->
				<w-box class="border-single p-1 flex-row gap-1">
					<w-text class="text-green">✓</w-text>
					<w-text class="text-green">Operation completed successfully</w-text>
				</w-box>

				<!-- Warning -->
				<w-box class="border-single p-1 flex-row gap-1">
					<w-text class="text-yellow">⚠</w-text>
					<w-text class="text-yellow">Configuration requires attention</w-text>
				</w-box>

				<!-- Error -->
				<w-box class="border-single p-1 flex-row gap-1">
					<w-text class="text-red">✗</w-text>
					<w-text class="text-red">Connection failed</w-text>
				</w-box>
			</w-box>

			<!-- Progress Indicator -->
			<w-box class="flex-col mt-1">
				<w-text class="text-white">Progress:</w-text>
				<w-box class="flex-row gap-1">
					<w-text class="text-green">{{ progressBar() }}</w-text>
					<w-text class="text-gray">{{ progressPercent() }}%</w-text>
				</w-box>
			</w-box>
		</w-box>
	`,
})
export class StatusDemoComponent implements OnInit, OnDestroy {
	//#region Signals
	readonly spinnerIndex = signal(0)
	readonly progress = signal(0)
	//#endregion Signals

	//#region Computed
	readonly spinnerFrame = () => SPINNER_FRAMES[this.spinnerIndex()]
	readonly progressBar = () => {
		const filled = this.progress()
		const empty = PROGRESS_MAX - filled
		return '█'.repeat(filled) + '░'.repeat(empty)
	}
	readonly progressPercent = () => this.progress() * 10
	//#endregion Computed

	//#region Intervals
	private spinnerInterval: ReturnType<typeof setInterval> | null = null
	private progressInterval: ReturnType<typeof setInterval> | null = null
	//#endregion Intervals

	//#region Lifecycle
	ngOnInit(): void {
		// Spinner animation
		this.spinnerInterval = setInterval(() => {
			this.spinnerIndex.update((i) => (i + 1) % SPINNER_FRAMES.length)
		}, SPINNER_INTERVAL_MS)

		// Progress animation
		this.progressInterval = setInterval(() => {
			this.progress.update((p) => (p + 1) % (PROGRESS_MAX + 1))
		}, PROGRESS_INTERVAL_MS)
	}

	ngOnDestroy(): void {
		if (this.spinnerInterval) {
			clearInterval(this.spinnerInterval)
			this.spinnerInterval = null
		}
		if (this.progressInterval) {
			clearInterval(this.progressInterval)
			this.progressInterval = null
		}
	}
	//#endregion Lifecycle
}
//#endregion StatusDemoComponent
