import type { Props as TextProps } from '../Text'
import type { IComponentTheme } from '../../theme/theme'

const theme = {
	styles: {
		value: (): TextProps => ({}),
	},
} satisfies IComponentTheme

export default theme
export type Theme = typeof theme
