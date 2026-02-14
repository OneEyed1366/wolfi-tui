import {
	Component,
	Input,
	ChangeDetectionStrategy,
	computed,
	signal,
} from '@angular/core'
import figures from 'figures'
import { BoxComponent } from '../box/box.component'
import { TextComponent } from '../text/text.component'
import type { Styles } from '@wolfie/core'

//#region Types
export interface SelectOptionProps {
	/**
	 * Determines if option is focused.
	 */
	isFocused: boolean

	/**
	 * Determines if option is selected.
	 */
	isSelected: boolean
}
//#endregion Types

//#region SelectOptionComponent
@Component({
	selector: 'w-select-option',
	standalone: true,
	imports: [BoxComponent, TextComponent],
	template: `
		<w-box [style]="optionStyle()">
			@if (isFocused) {
				<w-text [style]="focusIndicatorStyle()">{{ pointer }}</w-text>
			}
			<w-text [style]="labelStyle()"><ng-content /></w-text>
			@if (isSelected) {
				<w-text [style]="selectedIndicatorStyle()">{{ tick }}</w-text>
			}
		</w-box>
	`,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SelectOptionComponent {
	//#region Inputs
	@Input() isFocused = false
	@Input() isSelected = false
	//#endregion Inputs

	//#region Constants
	readonly pointer = figures.pointer
	readonly tick = figures.tick
	//#endregion Constants

	//#region Internal State
	private _isFocused = signal(false)
	private _isSelected = signal(false)
	//#endregion Internal State

	//#region Computed Styles
	readonly optionStyle = computed(
		(): Partial<Styles> => ({
			gap: 1,
			paddingLeft: this._isFocused() ? 0 : 2,
		})
	)

	readonly focusIndicatorStyle = computed(
		(): Partial<Styles> => ({
			color: 'blue',
		})
	)

	readonly selectedIndicatorStyle = computed(
		(): Partial<Styles> => ({
			color: 'green',
		})
	)

	readonly labelStyle = computed((): Partial<Styles> => {
		let color: string | undefined

		if (this._isSelected()) {
			color = 'green'
		}

		if (this._isFocused()) {
			color = 'blue'
		}

		return { color }
	})
	//#endregion Computed Styles

	//#region Lifecycle
	ngOnChanges(): void {
		// DEBUG: Confirm Angular propagates the [isSelected] binding change
		console.error('[SelectOption.ngOnChanges]', {
			isFocused: this.isFocused,
			isSelected: this.isSelected,
			labelStyleBefore: this.labelStyle(),
		})

		this._isFocused.set(this.isFocused)
		this._isSelected.set(this.isSelected)

		// Log again AFTER updating signals — labelStyle() should now reflect new state
		console.error('[SelectOption.ngOnChanges] after signal update', {
			labelStyleAfter: this.labelStyle(),
		})
	}
	//#endregion Lifecycle
}
//#endregion SelectOptionComponent
