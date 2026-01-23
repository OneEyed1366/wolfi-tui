import type { ReactNode } from 'react'
import { Box } from '../Box'
import { Text } from '../Text'
import { useComponentTheme } from '../../theme/theme'
import type { Option } from '../types'
import { MultiSelectOption } from './MultiSelectOption'
import { useMultiSelectState } from './use-multi-select-state'
import { useMultiSelect } from './use-multi-select'
import type { Theme } from './theme'

//#region Types
export type IMultiSelectProps = {
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
export function MultiSelect({
	isDisabled = false,
	visibleOptionCount = 5,
	highlightText,
	options,
	defaultValue,
	onChange,
	onSubmit,
}: IMultiSelectProps) {
	const state = useMultiSelectState({
		visibleOptionCount,
		options,
		defaultValue,
		onChange,
		onSubmit,
	})

	useMultiSelect({ isDisabled, state })

	const { styles } = useComponentTheme<Theme>('MultiSelect')

	return (
		<Box {...styles.container()}>
			{state.visibleOptions.map((option) => {
				let label: ReactNode = option.label

				if (highlightText && option.label.includes(highlightText)) {
					const index = option.label.indexOf(highlightText)

					label = (
						<>
							{option.label.slice(0, index)}
							<Text {...styles.highlightedText()}>{highlightText}</Text>
							{option.label.slice(index + highlightText.length)}
						</>
					)
				}

				return (
					<MultiSelectOption
						key={option.value}
						isFocused={!isDisabled && state.focusedValue === option.value}
						isSelected={state.value.includes(option.value)}
					>
						{label}
					</MultiSelectOption>
				)
			})}
		</Box>
	)
}
//#endregion Component
