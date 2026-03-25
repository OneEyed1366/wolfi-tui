import type { Styles } from '@wolf-tui/core'
import type { IComponentTheme } from '../theme/index.js'

//#region Types
export type OptionTheme = {
	styles: {
		option: (state: { isFocused: boolean }) => { style: Partial<Styles> }
		focusIndicator: () => { style: Partial<Styles> }
		label: (state: { isFocused: boolean; isSelected: boolean }) => {
			style: Partial<Styles>
		}
		selectedIndicator: () => { style: Partial<Styles> }
	}
}
//#endregion Types

//#region Default Theme
export const defaultOptionTheme = {
	styles: {
		option: ({ isFocused }: { isFocused: boolean }) => ({
			style: { gap: 1, paddingLeft: isFocused ? 0 : 2 },
		}),
		focusIndicator: () => ({
			style: { color: 'blue' },
		}),
		label: ({
			isFocused,
			isSelected,
		}: {
			isFocused: boolean
			isSelected: boolean
		}) => ({
			style: {
				color: isSelected ? 'green' : isFocused ? 'blue' : undefined,
			},
		}),
		selectedIndicator: () => ({
			style: { color: 'green' },
		}),
	},
} satisfies IComponentTheme
//#endregion Default Theme
