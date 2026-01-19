import type { ReactNode } from 'react'
import figures from 'figures'
import Box from '../../Box.js'
import Text from '../../Text.js'
import { useComponentTheme } from '../../../theme/theme.js'
import type { Theme } from './theme.js'

//#region Types
export type SelectOptionProps = {
	/**
	 * Determines if option is focused.
	 */
	readonly isFocused: boolean

	/**
	 * Determines if option is selected.
	 */
	readonly isSelected: boolean

	/**
	 * Option label.
	 */
	readonly children: ReactNode
}
//#endregion Types

//#region Component
export function SelectOption({
	isFocused,
	isSelected,
	children,
}: SelectOptionProps) {
	const { styles } = useComponentTheme<Theme>('Select')

	return (
		<Box {...styles.option({ isFocused })}>
			{isFocused && (
				<Text {...styles.focusIndicator()}>{figures.pointer}</Text>
			)}

			<Text {...styles.label({ isFocused, isSelected })}>{children}</Text>

			{isSelected && (
				<Text {...styles.selectedIndicator()}>{figures.tick}</Text>
			)}
		</Box>
	)
}
//#endregion Component
