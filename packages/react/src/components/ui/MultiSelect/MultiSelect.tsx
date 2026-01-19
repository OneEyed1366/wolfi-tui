import type { ReactNode } from 'react'
import Box from '../../Box'
import Text from '../../Text'
import { useComponentTheme } from '../../../theme/theme'
import type { Option } from '../types'
import { MultiSelectOption } from './MultiSelectOption'
import { useMultiSelectState } from './use-multi-select-state'
import { useMultiSelect } from './use-multi-select'
import type { Theme } from './theme'

//#region Types
export type MultiSelectProps = {
	/**
	 * When disabled, user input is ignored.
	 *
	 * @default false
	 */
	readonly isDisabled?: boolean

	/**
	 * Number of visible options.
	 *
	 * @default 5
	 */
	readonly visibleOptionCount?: number

	/**
	 * Highlight text in option labels.
	 * Useful for filtering options.
	 */
	readonly highlightText?: string

	/**
	 * Options.
	 */
	readonly options: Option[]

	/**
	 * Initially selected option values.
	 */
	readonly defaultValue?: string[]

	/**
	 * Callback for selecting options.
	 */
	readonly onChange?: (value: string[]) => void

	/**
	 * Callback when user presses enter.
	 * First argument is an array of selected option values.
	 */
	readonly onSubmit?: (value: string[]) => void
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
}: MultiSelectProps) {
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
