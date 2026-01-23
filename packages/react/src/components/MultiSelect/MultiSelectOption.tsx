import type { ReactNode } from 'react'
import figures from 'figures'
import { Box } from '../Box'
import { Text } from '../Text'
import { useComponentTheme } from '../../theme/theme'
import type { Theme } from './theme'

//#region Types
export type IMultiSelectOptionProps = {
	/**
	 * Determines if option is focused.
	 */
	isFocused: boolean

	/**
	 * Determines if option is selected.
	 */
	isSelected: boolean

	/**
	 * Option label.
	 */
	children: ReactNode
}
//#endregion Types

//#region Component
export function MultiSelectOption({
	isFocused,
	isSelected,
	children,
}: IMultiSelectOptionProps) {
	const { styles } = useComponentTheme<Theme>('MultiSelect')

	return (
		<Box {...styles.option({ isFocused })}>
			{isFocused && <Text {...styles.focusIndicator()}>{figures.pointer}</Text>}

			<Text {...styles.label({ isFocused, isSelected })}>{children}</Text>

			{isSelected && (
				<Text {...styles.selectedIndicator()}>{figures.tick}</Text>
			)}
		</Box>
	)
}
//#endregion Component
