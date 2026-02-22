import { type JSX, For, splitProps } from 'solid-js'
import { Box } from './Box'
import {
	MultiSelectOption,
	multiSelectTheme,
	type MultiSelectTheme,
} from './MultiSelectOption'
import { useComponentTheme } from '../theme'
import { useMultiSelectState } from '../composables/use-multi-select-state'
import { useMultiSelect } from '../composables/use-multi-select'
import type { Option } from '@wolfie/shared'

//#region Types
export interface IMultiSelectProps {
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
export function MultiSelect(props: IMultiSelectProps): JSX.Element {
	const [local] = splitProps(props, [
		'isDisabled',
		'visibleOptionCount',
		'options',
		'value',
		'defaultValue',
		'onChange',
		'onSubmit',
	])

	const state = useMultiSelectState({
		visibleOptionCount: local.visibleOptionCount,
		options: local.options,
		value: () => local.value, // WHY: accessor bc props are reactive in Solid
		defaultValue: local.defaultValue,
		onChange: local.onChange,
		onSubmit: local.onSubmit,
	})

	useMultiSelect({ isDisabled: () => local.isDisabled, state })

	const theme = useComponentTheme<MultiSelectTheme>('MultiSelect')
	const { styles } = theme ?? multiSelectTheme

	return (
		<Box {...styles.container()}>
			<For each={state.visibleOptions()}>
				{(option) => (
					<MultiSelectOption
						isFocused={!local.isDisabled && state.focusedValue() === option.value}
						isSelected={state.value().includes(option.value)}
					>
						{option.label}
					</MultiSelectOption>
				)}
			</For>
		</Box>
	)
}
//#endregion Component

export { multiSelectTheme, type MultiSelectTheme }
