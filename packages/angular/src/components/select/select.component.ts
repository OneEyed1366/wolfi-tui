import type { OnInit, OnDestroy } from '@angular/core'
import {
	Component,
	Input,
	Output,
	EventEmitter,
	ChangeDetectionStrategy,
	signal,
	computed,
} from '@angular/core'
import { BoxComponent } from '../box/box.component'
import { TextComponent } from '../text/text.component'
import { SelectOptionComponent } from './select-option.component'
import { injectInput, type Key } from '../../services/stdin.service'
import { OptionMap, type Option } from '@wolfie/shared'
import type { Styles } from '@wolfie/core'

//#region Types
export interface SelectProps {
	/**
	 * When disabled, user input is ignored.
	 *
	 * @default false
	 */
	isDisabled?: boolean

	/**
	 * Number of visible options.
	 *
	 * @default 5
	 */
	visibleOptionCount?: number

	/**
	 * Highlight text in option labels.
	 */
	highlightText?: string

	/**
	 * Options.
	 */
	options: Option[]

	/**
	 * Default value.
	 */
	defaultValue?: string
}
//#endregion Types

//#region SelectComponent
@Component({
	selector: 'w-select',
	standalone: true,
	imports: [BoxComponent, TextComponent, SelectOptionComponent],
	template: `
		<w-box [style]="containerStyle">
			@for (option of visibleOptions(); track option.value) {
				<w-select-option
					[isFocused]="!isDisabled && focusedValue() === option.value"
					[isSelected]="value() === option.value"
				>
					@if (highlightText && option.label.includes(highlightText)) {
						{{ getBeforeHighlight(option.label)
						}}<w-text [style]="highlightStyle">{{ highlightText }}</w-text
						>{{ getAfterHighlight(option.label) }}
					} @else {
						{{ option.label }}
					}
				</w-select-option>
			}
		</w-box>
	`,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SelectComponent implements OnInit, OnDestroy {
	//#region Internal State
	private _isDisabled = signal(false)
	private optionMap = signal<OptionMap>(new OptionMap([]))
	private visibleCount = signal(5)
	readonly focusedValue = signal<string | undefined>(undefined)
	private visibleFromIndex = signal(0)
	private visibleToIndex = signal(5)
	readonly value = signal<string | undefined>(undefined)
	private previousValue = signal<string | undefined>(undefined)
	private lastOptions = signal<Option[]>([])
	//#endregion Internal State

	//#region Inputs
	@Input() set isDisabled(value: boolean) {
		this._isDisabled.set(value)
	}
	get isDisabled(): boolean {
		return this._isDisabled()
	}
	@Input() visibleOptionCount = 5
	@Input() highlightText?: string
	@Input() options: Option[] = []
	@Input() defaultValue?: string
	//#endregion Inputs

	//#region Outputs
	@Output() selectChange = new EventEmitter<string>()
	//#endregion Outputs

	//#region Styles
	readonly containerStyle: Partial<Styles> = {
		flexDirection: 'column',
	}

	readonly highlightStyle: Partial<Styles> = {
		fontWeight: 'bold',
	}
	//#endregion Styles

	//#region Computed State
	readonly visibleOptions = computed(() => {
		const options = this.lastOptions()
		return options
			.map((option, index) => ({ ...option, index }))
			.slice(this.visibleFromIndex(), this.visibleToIndex())
	})
	//#endregion Computed State

	//#region Constructor
	constructor() {
		injectInput((input: string, key: Key) => this.handleInput(input, key), {
			isActive: () => !this._isDisabled(),
		})
	}
	//#endregion Constructor

	//#region Highlight Helpers
	getBeforeHighlight(label: string): string {
		if (!this.highlightText) return label
		const index = label.indexOf(this.highlightText)
		return index >= 0 ? label.slice(0, index) : label
	}

	getAfterHighlight(label: string): string {
		if (!this.highlightText) return ''
		const index = label.indexOf(this.highlightText)
		return index >= 0 ? label.slice(index + this.highlightText.length) : ''
	}
	//#endregion Highlight Helpers

	//#region State Operations
	private focusNextOption(): void {
		const currentFocused = this.focusedValue()
		if (!currentFocused) return

		const item = this.optionMap().get(currentFocused)
		if (!item) return

		const next = item.next
		if (!next) return

		const needsToScroll = next.index >= this.visibleToIndex()

		if (!needsToScroll) {
			this.focusedValue.set(next.value)
			return
		}

		const nextVisibleToIndex = Math.min(
			this.optionMap().size,
			this.visibleToIndex() + 1
		)
		const nextVisibleFromIndex = nextVisibleToIndex - this.visibleCount()

		this.focusedValue.set(next.value)
		this.visibleFromIndex.set(nextVisibleFromIndex)
		this.visibleToIndex.set(nextVisibleToIndex)
	}

	private focusPreviousOption(): void {
		const currentFocused = this.focusedValue()
		if (!currentFocused) return

		const item = this.optionMap().get(currentFocused)
		if (!item) return

		const previous = item.previous
		if (!previous) return

		const needsToScroll = previous.index < this.visibleFromIndex()

		if (!needsToScroll) {
			this.focusedValue.set(previous.value)
			return
		}

		const nextVisibleFromIndex = Math.max(0, this.visibleFromIndex() - 1)
		const nextVisibleToIndex = nextVisibleFromIndex + this.visibleCount()

		this.focusedValue.set(previous.value)
		this.visibleFromIndex.set(nextVisibleFromIndex)
		this.visibleToIndex.set(nextVisibleToIndex)
	}

	private selectFocusedOption(): void {
		const currentFocused = this.focusedValue()
		const currentValue = this.value()

		// DEBUG: Confirm selection actually changes
		console.error('[Select.selectFocusedOption]', {
			from: currentValue,
			to: currentFocused,
		})

		this.previousValue.set(currentValue)
		this.value.set(currentFocused)

		if (currentFocused && currentFocused !== currentValue) {
			this.selectChange.emit(currentFocused)
		}
	}
	//#endregion State Operations

	//#region Input Handler
	private handleInput(_input: string, key: Key): void {
		if (key.downArrow) {
			this.focusNextOption()
		}

		if (key.upArrow) {
			this.focusPreviousOption()
		}

		if (key.return) {
			this.selectFocusedOption()
		}
	}
	//#endregion Input Handler

	//#region Lifecycle
	ngOnInit(): void {
		this.initializeState()
	}

	ngOnDestroy(): void {}

	ngOnChanges(changes: import('@angular/core').SimpleChanges): void {
		// Only re-initialize when options change, NOT when isDisabled changes
		// Resetting state on isDisabled change causes selected value to be lost
		if (
			changes['options'] ||
			changes['visibleOptionCount'] ||
			changes['defaultValue']
		) {
			this.initializeState()
		}
	}

	private initializeState(): void {
		const options = this.options
		const visibleOptionCount = Math.min(this.visibleOptionCount, options.length)
		const newOptionMap = new OptionMap(options)

		this.optionMap.set(newOptionMap)
		this.visibleCount.set(visibleOptionCount)
		this.focusedValue.set(newOptionMap.first?.value)
		this.visibleFromIndex.set(0)
		this.visibleToIndex.set(visibleOptionCount)
		this.previousValue.set(this.defaultValue)
		this.value.set(this.defaultValue)
		this.lastOptions.set(options)
	}
	//#endregion Lifecycle
}
//#endregion SelectComponent
