import {
	defineComponent,
	toRef,
	type PropType,
	type VNode,
	type DefineComponent,
} from 'vue'
import { Box } from './Box'
import { Text } from './Text'
import { SelectOption, selectTheme, type SelectTheme } from './SelectOption'
import { useComponentTheme } from '../theme'
import type { Option } from '../types'
import { useSelectState } from '../composables/use-select-state'
import { useSelect } from '../composables/use-select'

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

	/**
	 * Callback when selected option changes.
	 */
	onChange?: (value: string) => void
}
//#endregion Types

//#region Component
export const Select: DefineComponent<SelectProps> = defineComponent({
	name: 'Select',
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
		defaultValue: {
			type: String,
			default: undefined,
		},
		onChange: {
			type: Function as PropType<(value: string) => void>,
			default: undefined,
		},
	},
	setup(props) {
		const state = useSelectState({
			visibleOptionCount: props.visibleOptionCount,
			options: props.options,
			defaultValue: props.defaultValue,
			onChange: props.onChange,
		})

		useSelect({ isDisabled: toRef(props, 'isDisabled'), state })

		const theme = useComponentTheme<SelectTheme>('Select')
		const { styles } = theme ?? selectTheme

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
						<SelectOption
							key={option.value}
							isFocused={
								!props.isDisabled && state.focusedValue.value === option.value
							}
							isSelected={state.value.value === option.value}
						>
							{label}
						</SelectOption>
					)
				})}
			</Box>
		)
	},
})
//#endregion Component

export { selectTheme, type SelectTheme }
export type { SelectProps as Props, SelectProps as IProps }
