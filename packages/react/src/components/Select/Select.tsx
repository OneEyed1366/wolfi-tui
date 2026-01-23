import type { ReactNode } from 'react'
import { Box } from '../Box'
import { Text } from '../Text'
import { useComponentTheme } from '../../theme/theme'
import type { Option } from '../types'
import { SelectOption } from './SelectOption'
import { useSelectState } from './use-select-state'
import { useSelect } from './use-select'
import type { Theme } from './theme'

//#region Types
export type ISelectProps = {
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
export function Select({
	isDisabled = false,
	visibleOptionCount = 5,
	highlightText,
	options,
	defaultValue,
	onChange,
}: ISelectProps) {
	const state = useSelectState({
		visibleOptionCount,
		options,
		defaultValue,
		onChange,
	})

	useSelect({ isDisabled, state })

	const { styles } = useComponentTheme<Theme>('Select')

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
					<SelectOption
						key={option.value}
						isFocused={!isDisabled && state.focusedValue === option.value}
						isSelected={state.value === option.value}
					>
						{label}
					</SelectOption>
				)
			})}
		</Box>
	)
}
//#endregion Component
