import { type JSX, For, splitProps } from 'solid-js'
import { Box } from './Box'
import { Text } from './Text'
import { SelectOption, selectTheme, type SelectTheme } from './SelectOption'
import { useComponentTheme } from '../theme'
import { useSelectState } from '../composables/use-select-state'
import { useSelect } from '../composables/use-select'
import type { Option } from '@wolfie/shared'

//#region Types
export interface ISelectProps {
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
	 * Controlled value. When provided, component always reflects this value.
	 */
	value?: string

	/**
	 * Default value (uncontrolled mode).
	 */
	defaultValue?: string

	/**
	 * Callback when selected option changes.
	 */
	onChange?: (value: string) => void
}
//#endregion Types

//#region Component
export function Select(props: ISelectProps): JSX.Element {
	const [local] = splitProps(props, [
		'isDisabled',
		'visibleOptionCount',
		'highlightText',
		'options',
		'value',
		'defaultValue',
		'onChange',
	])

	const state = useSelectState({
		visibleOptionCount: local.visibleOptionCount,
		options: local.options,
		value: () => local.value, // WHY: accessor bc props are reactive in Solid
		defaultValue: local.defaultValue,
		onChange: local.onChange,
	})

	useSelect({ isDisabled: () => local.isDisabled, state })

	const theme = useComponentTheme<SelectTheme>('Select')
	const { styles } = theme ?? selectTheme

	return (
		<Box {...styles.container()}>
			<For each={state.visibleOptions()}>
				{(option) => {
					const isFocused = !local.isDisabled && state.focusedValue() === option.value
					const isSelected = state.value() === option.value

					let label: JSX.Element = <>{option.label}</>

					if (local.highlightText && option.label.includes(local.highlightText)) {
						const idx = option.label.indexOf(local.highlightText)
						label = (
							<>
								{option.label.slice(0, idx)}
								<Text {...styles.highlightedText()}>{local.highlightText}</Text>
								{option.label.slice(idx + local.highlightText.length)}
							</>
						)
					}

					return (
						<SelectOption isFocused={isFocused} isSelected={isSelected}>
							{label}
						</SelectOption>
					)
				}}
			</For>
		</Box>
	)
}
//#endregion Component

export { selectTheme, type SelectTheme }
