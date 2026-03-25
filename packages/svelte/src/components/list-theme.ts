import figures from 'figures'
import type { Styles } from '@wolf-tui/core'
import type { IComponentTheme } from '../theme/index.js'

//#region Types
export type OrderedListTheme = {
	styles: {
		list: () => { style: Partial<Styles> }
		listItem: () => { style: Partial<Styles> }
		marker: () => { style: Partial<Styles> }
		content: () => { style: Partial<Styles> }
	}
}

export type UnorderedListTheme = {
	styles: {
		list: () => { style: Partial<Styles> }
		listItem: () => { style: Partial<Styles> }
		marker: () => { style: Partial<Styles> }
		content: () => { style: Partial<Styles> }
	}
	config: () => { marker: string | string[] }
}
//#endregion Types

//#region Default Themes
export const orderedListTheme = {
	styles: {
		list: () => ({ style: { flexDirection: 'column' } }),
		listItem: () => ({ style: { flexDirection: 'row' } }),
		marker: () => ({ style: { color: 'green' } }),
		content: () => ({ style: { flexDirection: 'column', marginLeft: 1 } }),
	},
} satisfies IComponentTheme

export const unorderedListTheme = {
	styles: {
		list: () => ({ style: { flexDirection: 'column' } }),
		listItem: () => ({ style: { flexDirection: 'row' } }),
		marker: () => ({ style: { color: 'green' } }),
		content: () => ({ style: { flexDirection: 'column', marginLeft: 1 } }),
	},
	config: () => ({
		marker: [figures.bullet, figures.line, figures.pointer],
	}),
} satisfies IComponentTheme
//#endregion Default Themes
