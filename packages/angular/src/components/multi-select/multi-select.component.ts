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
import { MultiSelectOptionComponent } from './multi-select-option.component'
import { injectInput, type Key } from '../../services/stdin.service'
import OptionMap, { type Option } from '../../lib/option-map'
import type { Styles } from '@wolfie/core'

//#region Types
export interface MultiSelectProps {
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
	 * Useful for filtering options.
	 */
	highlightText?: string

	/**
	 * Options.
	 */
	options: Option[]

	/**
	 * Initially selected option values.
	 */
	defaultValue?: string[]
}
//#endregion Types

//#region MultiSelectComponent
@Component({
	selector: 'w-multi-select',
	standalone: true,
	imports: [BoxComponent, TextComponent, MultiSelectOptionComponent],
	template: `
		<w-box [style]="containerStyle">
			@for (option of visibleOptions(); track option.value) {
				<w-multi-select-option
					[isFocused]="!isDisabled && focusedValue() === option.value"
					[isSelected]="value().includes(option.value)"
				>
					@if (highlightText && option.label.includes(highlightText)) {
						{{ getBeforeHighlight(option.label)
						}}<w-text [style]="highlightStyle">{{ highlightText }}</w-text
						>{{ getAfterHighlight(option.label) }}
					} @else {
						{{ option.label }}
					}
				</w-multi-select-option>
			}
		</w-box>
	`,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MultiSelectComponent implements OnInit, OnDestroy {
	//#region Inputs
	@Input() isDisabled = false
	@Input() visibleOptionCount = 5
	@Input() highlightText?: string
	@Input() options: Option[] = []
	@Input() defaultValue?: string[]
	//#endregion Inputs

	//#region Outputs
	@Output() selectionChange = new EventEmitter<string[]>()
	@Output() submitSelection = new EventEmitter<string[]>()
	//#endregion Outputs

	//#region Styles
	readonly containerStyle: Partial<Styles> = {
		flexDirection: 'column',
	}

	readonly highlightStyle: Partial<Styles> = {
		fontWeight: 'bold',
	}
	//#endregion Styles

	//#region Internal State
	private optionMap = signal<OptionMap>(new OptionMap([]))
	private visibleCount = signal(5)
	readonly focusedValue = signal<string | undefined>(undefined)
	private visibleFromIndex = signal(0)
	private visibleToIndex = signal(5)
	readonly value = signal<string[]>([])
	private previousValue = signal<string[]>([])
	private lastOptions = signal<Option[]>([])
	//#endregion Internal State

	//#region Computed State
	readonly visibleOptions = computed(() => {
		const options = this.lastOptions()
		return options
			.map((option, index) => ({ ...option, index }))
			.slice(this.visibleFromIndex(), this.visibleToIndex())
	})

	private isActive = computed(() => !this.isDisabled)
	//#endregion Computed State

	//#region Constructor
	constructor() {
		injectInput((input: string, key: Key) => this.handleInput(input, key), {
			isActive: () => this.isActive(),
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

	private toggleFocusedOption(): void {
		const currentFocused = this.focusedValue()
		if (!currentFocused) return

		const currentValue = this.value()

		if (currentValue.includes(currentFocused)) {
			// Remove from selection
			const newValue = currentValue.filter((v) => v !== currentFocused)
			this.previousValue.set(currentValue)
			this.value.set(newValue)
			this.selectionChange.emit(newValue)
		} else {
			// Add to selection
			const newValue = [...currentValue, currentFocused]
			this.previousValue.set(currentValue)
			this.value.set(newValue)
			this.selectionChange.emit(newValue)
		}
	}

	private submit(): void {
		this.submitSelection.emit(this.value())
	}
	//#endregion State Operations

	//#region Input Handler
	private handleInput(input: string, key: Key): void {
		if (key.downArrow) {
			this.focusNextOption()
		}

		if (key.upArrow) {
			this.focusPreviousOption()
		}

		if (input === ' ') {
			this.toggleFocusedOption()
		}

		if (key.return) {
			this.submit()
		}
	}
	//#endregion Input Handler

	//#region Lifecycle
	ngOnInit(): void {
		this.initializeState()
	}

	ngOnDestroy(): void {
		// Cleanup handled by Angular
	}

	ngOnChanges(): void {
		this.initializeState()
	}

	private initializeState(): void {
		const options = this.options
		const visibleOptionCount = Math.min(this.visibleOptionCount, options.length)
		const newOptionMap = new OptionMap(options)
		const initialValue = this.defaultValue ?? []

		this.optionMap.set(newOptionMap)
		this.visibleCount.set(visibleOptionCount)
		this.focusedValue.set(newOptionMap.first?.value)
		this.visibleFromIndex.set(0)
		this.visibleToIndex.set(visibleOptionCount)
		this.previousValue.set(initialValue)
		this.value.set(initialValue)
		this.lastOptions.set(options)
	}
	//#endregion Lifecycle
}
//#endregion MultiSelectComponent
