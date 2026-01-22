import type { Props as BoxProps } from '../../Box'
import type { Props as TextProps } from '../../Text'
import type { ComponentTheme } from '../../../theme/theme'

//#region Types
export type OrderedListTheme = {
	styles: {
		list: () => Partial<BoxProps>
		listItem: () => Partial<BoxProps>
		marker: () => Partial<TextProps>
		content: () => Partial<BoxProps>
	}
}
//#endregion Types

//#region Theme
export const orderedListTheme = {
	styles: {
		list: (): Partial<BoxProps> => ({
			style: {
				flexDirection: 'column',
			},
		}),
		listItem: (): Partial<BoxProps> => ({
			style: {
				flexDirection: 'row',
			},
		}),
		marker: (): Partial<TextProps> => ({
			style: {
				color: 'green',
			},
		}),
		content: (): Partial<BoxProps> => ({
			style: {
				flexDirection: 'column',
				marginLeft: 1,
			},
		}),
	},
} satisfies ComponentTheme
//#endregion Theme
