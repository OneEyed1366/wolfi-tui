import figures from 'figures'
import type { Props as BoxProps } from '../Box'
import type { Props as TextProps } from '../Text'
import type { IComponentTheme } from '../../theme/theme'

//#region Types
export type IUnorderedListTheme = {
	styles: {
		list: () => Partial<BoxProps>
		listItem: () => Partial<BoxProps>
		marker: () => Partial<TextProps>
		content: () => Partial<BoxProps>
	}
	config: () => {
		marker: string | string[]
	}
}
//#endregion Types

//#region Theme
export const unorderedListTheme = {
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
	config() {
		return {
			marker: [figures.bullet, figures.line, figures.pointer],
		}
	},
} satisfies IComponentTheme
//#endregion Theme
