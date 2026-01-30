import type { OnInit, OnDestroy } from '@angular/core'
import {
	Component,
	Input,
	ChangeDetectionStrategy,
	ChangeDetectorRef,
	signal,
	computed,
	NgZone,
	inject,
} from '@angular/core'
import type { Styles } from '@wolfie/core'
import spinners, { type SpinnerName } from 'cli-spinners'
import { BoxComponent } from '../box/box.component'
import { TextComponent } from '../text/text.component'

//#region Types
export interface SpinnerProps {
	/**
	 * Type of a spinner.
	 * See [cli-spinners](https://github.com/sindresorhus/cli-spinners) for available spinners.
	 *
	 * @default "dots"
	 */
	type?: SpinnerName

	/**
	 * Label to show near the spinner.
	 */
	label?: string
}
//#endregion Types

//#region Theme
const spinnerTheme = {
	styles: {
		container: (): Partial<Styles> => ({
			gap: 1,
		}),
		frame: (): Partial<Styles> => ({
			color: 'blue',
		}),
		label: (): Partial<Styles> => ({}),
	},
}
//#endregion Theme

//#region SpinnerComponent
/**
 * `<w-spinner>` displays an animated loading spinner.
 */
@Component({
	selector: 'w-spinner',
	standalone: true,
	imports: [BoxComponent, TextComponent],
	template: `
		<w-box [style]="containerStyle()">
			<w-text [style]="frameStyle()">{{ frame() }}</w-text>
			@if (label) {
				<w-text [style]="labelStyle()">{{ label }}</w-text>
			}
		</w-box>
	`,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SpinnerComponent implements OnInit, OnDestroy {
	//#region Inputs
	@Input() type: SpinnerName = 'dots'
	@Input() label?: string
	//#endregion Inputs

	//#region Injected Dependencies
	private ngZone = inject(NgZone)
	private cdr = inject(ChangeDetectorRef)
	//#endregion Injected Dependencies

	//#region Internal State
	private _type = signal<SpinnerName>('dots')
	private _frameIndex = signal(0)
	private timer: ReturnType<typeof setInterval> | null = null
	//#endregion Internal State

	//#region Computed Properties
	readonly containerStyle = computed(() => spinnerTheme.styles.container())
	readonly frameStyle = computed(() => spinnerTheme.styles.frame())
	readonly labelStyle = computed(() => spinnerTheme.styles.label())

	readonly frame = computed(() => {
		const spinner = spinners[this._type()]
		return spinner.frames[this._frameIndex()] ?? ''
	})
	//#endregion Computed Properties

	//#region Lifecycle
	ngOnInit(): void {
		this._type.set(this.type)
		this.startSpinner()
	}

	ngOnDestroy(): void {
		this.stopSpinner()
	}

	ngOnChanges(): void {
		this._type.set(this.type)
		// Restart spinner if type changed
		this.stopSpinner()
		this.startSpinner()
	}
	//#endregion Lifecycle

	//#region Private Methods
	private startSpinner(): void {
		const spinner = spinners[this._type()]

		// Run outside Angular zone to avoid unnecessary change detection
		this.ngZone.runOutsideAngular(() => {
			this.timer = setInterval(() => {
				this.ngZone.run(() => {
					const currentIndex = this._frameIndex()
					const isLastFrame = currentIndex === spinner.frames.length - 1
					this._frameIndex.set(isLastFrame ? 0 : currentIndex + 1)
					// Force immediate change detection for OnPush component
					this.cdr.detectChanges()
				})
			}, spinner.interval)
		})
	}

	private stopSpinner(): void {
		if (this.timer) {
			clearInterval(this.timer)
			this.timer = null
		}
	}
	//#endregion Private Methods
}
//#endregion SpinnerComponent
