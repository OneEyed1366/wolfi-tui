import type { Props as BoxProps } from '../../Box'
import type { Props as TextProps } from '../../Text'
import type { ComponentTheme } from '../../../theme/theme'

const theme = {
	styles: {
		container: (): BoxProps => ({
			flexDirection: 'column',
		}),
		option: ({ isFocused }: { isFocused: boolean }): BoxProps => ({
			gap: 1,
			paddingLeft: isFocused ? 0 : 2,
		}),
		selectedIndicator: (): TextProps => ({
			color: 'green',
		}),
		focusIndicator: (): TextProps => ({
			color: 'blue',
		}),
		label({
			isFocused,
			isSelected,
		}: {
			isFocused: boolean
			isSelected: boolean
		}): TextProps {
			let color: string | undefined

			if (isSelected) {
				color = 'green'
			}

			if (isFocused) {
				color = 'blue'
			}

			return { color }
		},
		highlightedText: (): TextProps => ({
			bold: true,
		}),
	},
} satisfies ComponentTheme

export default theme
export type Theme = typeof theme
