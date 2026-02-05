import {
	defineComponent,
	toRef,
	type PropType,
	type VNode,
	type DefineComponent,
} from 'vue'
import { Box } from './Box'
import { Text } from './Text'
import {
	MultiSelectOption,
	multiSelectTheme,
	type MultiSelectTheme,
} from './MultiSelectOption'
import { useComponentTheme } from '../theme'
import type { Option } from '../types'
import { useMultiSelectState } from '../composables/use-multi-select-state'
import { useMultiSelect } from '../composables/use-multi-select'

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
	 * Controlled value. When provided, component always reflects this value.
	 */
	value?: string[]

	/**
	 * Initially selected option values (uncontrolled mode).
	 */
	defaultValue?: string[]

	/**
	 * Callback for selecting options.
	 */
	onChange?: (value: string[]) => void

	/**
	 * Callback when user presses enter.
	 * First argument is an array of selected option values.
	 */
	onSubmit?: (value: string[]) => void
}
//#endregion Types

//#region Component
export const MultiSelect: DefineComponent<MultiSelectProps> = defineComponent({
	name: 'MultiSelect',
	props: {
		isDisabled: {
			type: Boolean,
			default: false,
		},
		visibleOptionCount: {
			type: Number,
			default: 5,
		},
		highlightText: {
			type: String,
			default: undefined,
		},
		options: {
			type: Array as PropType<Option[]>,
			required: true,
		},
		value: {
			type: Array as PropType<string[]>,
			default: undefined,
		},
		defaultValue: {
			type: Array as PropType<string[]>,
			default: undefined,
		},
		onChange: {
			type: Function as PropType<(value: string[]) => void>,
			default: undefined,
		},
		onSubmit: {
			type: Function as PropType<(value: string[]) => void>,
			default: undefined,
		},
	},
	setup(props) {
		const state = useMultiSelectState({
			visibleOptionCount: props.visibleOptionCount,
			options: props.options,
			value: toRef(props, 'value'),
			defaultValue: props.defaultValue,
			onChange: props.onChange,
			onSubmit: props.onSubmit,
		})

		useMultiSelect({ isDisabled: toRef(props, 'isDisabled'), state })

		const theme = useComponentTheme<MultiSelectTheme>('MultiSelect')
		const { styles } = theme ?? multiSelectTheme

		return () => (
			<Box {...styles.container()}>
				{state.visibleOptions.value.map((option) => {
					let label: VNode | VNode[] | string = option.label

					if (
						props.highlightText &&
						option.label.includes(props.highlightText)
					) {
						const index = option.label.indexOf(props.highlightText)

						label = (
							<>
								{option.label.slice(0, index)}
								<Text {...styles.highlightedText()}>{props.highlightText}</Text>
								{option.label.slice(index + props.highlightText.length)}
							</>
						) as unknown as VNode
					}

					return (
						<MultiSelectOption
							key={option.value}
							isFocused={
								!props.isDisabled && state.focusedValue.value === option.value
							}
							isSelected={state.value.value.includes(option.value)}
						>
							{label}
						</MultiSelectOption>
					)
				})}
			</Box>
		)
	},
})
//#endregion Component

export { multiSelectTheme, type MultiSelectTheme }
export type { MultiSelectProps as Props, MultiSelectProps as IProps }
