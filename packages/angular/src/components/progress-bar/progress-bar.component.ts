import type { OnInit, OnDestroy, AfterViewInit } from '@angular/core'
import {
	Component,
	Input,
	ChangeDetectionStrategy,
	signal,
	computed,
	ElementRef,
	inject,
} from '@angular/core'
import type { Styles, DOMElement } from '@wolfie/core'
import { measureElement } from '@wolfie/core'
import figures from 'figures'
import { BoxComponent } from '../box/box.component'
import { TextComponent } from '../text/text.component'

//#region Types
export interface ProgressBarProps {
	/**
	 * Progress.
	 * Must be between 0 and 100.
	 *
	 * @default 0
	 */
	value: number
}
//#endregion Types

//#region Theme
const progressBarTheme = {
	styles: {
		container: (): Partial<Styles> => ({
			flexGrow: 1,
			minWidth: 0,
		}),
		completed: (): Partial<Styles> => ({
			color: 'magenta',
		}),
		remaining: (): Partial<Styles> => ({
			color: 'gray',
		}),
	},
	config: () => ({
		// Character for rendering a completed bar
		completedCharacter: figures.square,

		// Character for rendering a remaining bar
		remainingCharacter: figures.squareLightShade,
	}),
}
//#endregion Theme

//#region ProgressBarComponent
/**
 * `<w-progress-bar>` displays a visual progress indicator.
 */
@Component({
	selector: 'w-progress-bar',
	standalone: true,
	imports: [BoxComponent, TextComponent],
	template: `
		<w-box [style]="containerStyle()">
			@if (complete() > 0) {
				<w-text [style]="completedStyle()">{{ completedBar() }}</w-text>
			}
			@if (remaining() > 0) {
				<w-text [style]="remainingStyle()">{{ remainingBar() }}</w-text>
			}
		</w-box>
	`,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProgressBarComponent implements OnInit, OnDestroy, AfterViewInit {
	//#region Inputs
	@Input({ required: true }) value!: number
	//#endregion Inputs

	//#region Injected Dependencies
	private elementRef = inject(ElementRef)
	//#endregion Injected Dependencies

	//#region Internal State
	private _value = signal(0)
	private _width = signal(0)
	//#endregion Internal State

	//#region Computed Properties
	readonly containerStyle = computed(() => progressBarTheme.styles.container())
	readonly completedStyle = computed(() => progressBarTheme.styles.completed())
	readonly remainingStyle = computed(() => progressBarTheme.styles.remaining())

	readonly progress = computed(() => Math.min(100, Math.max(0, this._value())))
	readonly complete = computed(() =>
		Math.round((this.progress() / 100) * this._width())
	)
	readonly remaining = computed(() => this._width() - this.complete())

	readonly completedBar = computed(() =>
		progressBarTheme.config().completedCharacter.repeat(this.complete())
	)
	readonly remainingBar = computed(() =>
		progressBarTheme.config().remainingCharacter.repeat(this.remaining())
	)
	//#endregion Computed Properties

	//#region Lifecycle
	ngOnInit(): void {
		this._value.set(this.value)
	}

	ngAfterViewInit(): void {
		this.measureWidth()
	}

	ngOnDestroy(): void {
		// Cleanup handled by Angular
	}

	ngOnChanges(): void {
		this._value.set(this.value)
		this.measureWidth()
	}
	//#endregion Lifecycle

	//#region Private Methods
	private measureWidth(): void {
		const el = this.elementRef.nativeElement as DOMElement
		if (el) {
			const dimensions = measureElement(el)
			if (dimensions.width !== this._width()) {
				this._width.set(dimensions.width)
			}
		}
	}
	//#endregion Private Methods
}
//#endregion ProgressBarComponent
