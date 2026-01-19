import type { Props as TextProps } from '../../Text'
import type { ComponentTheme } from '../../../theme/theme'

const theme = {
	styles: {
		value: (): TextProps => ({}),
	},
} satisfies ComponentTheme

export default theme
export type Theme = typeof theme
