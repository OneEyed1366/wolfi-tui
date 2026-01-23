import type { Props as BoxProps } from '../Box'
import type { Props as TextProps } from '../Text'
import type { IComponentTheme } from '../../theme/theme'

const theme = {
	styles: {
		container: (): BoxProps => ({
			style: {
				flexDirection: 'column',
			},
		}),
		option: ({ isFocused }: { isFocused: boolean }): BoxProps => ({
			style: {
				gap: 1,
				paddingLeft: isFocused ? 0 : 2,
			},
		}),
		selectedIndicator: (): TextProps => ({
			style: {
				color: 'green',
			},
		}),
		focusIndicator: (): TextProps => ({
			style: {
				color: 'blue',
			},
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

			return {
				style: {
					color,
				},
			}
		},
		highlightedText: (): TextProps => ({
			style: {
				fontWeight: 'bold',
			},
		}),
	},
} satisfies IComponentTheme

export default theme
export type Theme = typeof theme
