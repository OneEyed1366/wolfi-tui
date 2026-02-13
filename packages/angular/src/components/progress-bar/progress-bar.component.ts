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
import {
	THEME_CONTEXT,
	useComponentTheme,
	type IComponentTheme,
} from '../../theme'

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
export const progressBarTheme: IComponentTheme = {
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

	//#region Theme
	private readonly theme = inject(THEME_CONTEXT)
	private readonly componentTheme = computed(
		() =>
			useComponentTheme<IComponentTheme>(this.theme, 'ProgressBar') ??
			progressBarTheme
	)
	//#endregion Theme

	//#region Internal State
	private _value = signal(0)
	private _width = signal(0)
	//#endregion Internal State

	//#region Computed Properties
	readonly containerStyle = computed(
		() =>
			this.componentTheme().styles?.container?.() ??
			progressBarTheme.styles!.container()
	)
	readonly completedStyle = computed(
		() =>
			this.componentTheme().styles?.completed?.() ??
			progressBarTheme.styles!.completed()
	)
	readonly remainingStyle = computed(
		() =>
			this.componentTheme().styles?.remaining?.() ??
			progressBarTheme.styles!.remaining()
	)

	readonly progress = computed(() => Math.min(100, Math.max(0, this._value())))
	readonly complete = computed(() =>
		Math.round((this.progress() / 100) * this._width())
	)
	readonly remaining = computed(() => this._width() - this.complete())

	readonly completedBar = computed(() => {
		const config = this.componentTheme().config?.() as
			| { completedCharacter: string }
			| undefined
		const char =
			config?.completedCharacter ??
			(progressBarTheme.config!() as { completedCharacter: string })
				.completedCharacter
		return char.repeat(this.complete())
	})
	readonly remainingBar = computed(() => {
		const config = this.componentTheme().config?.() as
			| { remainingCharacter: string }
			| undefined
		const char =
			config?.remainingCharacter ??
			(progressBarTheme.config!() as { remainingCharacter: string })
				.remainingCharacter
		return char.repeat(this.remaining())
	})
	//#endregion Computed Properties

	//#region Lifecycle
	ngOnInit(): void {
		this._value.set(this.value)
	}

	ngAfterViewInit(): void {
		this.measureWidth()
	}

	ngOnDestroy(): void {}

	ngOnChanges(): void {
		this._value.set(this.value)
		// Width is measured once in ngAfterViewInit - no need to remeasure on value changes
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
