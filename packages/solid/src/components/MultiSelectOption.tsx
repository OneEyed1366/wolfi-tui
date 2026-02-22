import { type JSX, Show, splitProps } from 'solid-js'
import figures from 'figures'
import { Box, type BoxProps } from './Box'
import { Text, type TextProps } from './Text'
import { useComponentTheme, type IComponentTheme } from '../theme'

//#region Types
export interface IMultiSelectOptionProps {
	isFocused: boolean
	isSelected: boolean
	children?: JSX.Element
}

export type MultiSelectTheme = IComponentTheme & {
	styles: {
		container: () => Partial<BoxProps>
		option: (props: { isFocused: boolean }) => Partial<BoxProps>
		selectedIndicator: () => Partial<TextProps>
		focusIndicator: () => Partial<TextProps>
		label: (props: { isFocused: boolean; isSelected: boolean }) => Partial<TextProps>
		highlightedText: () => Partial<TextProps>
	}
}
//#endregion Types

//#region Theme
export const multiSelectTheme: MultiSelectTheme = {
	styles: {
		container: (): Partial<BoxProps> => ({
			style: { flexDirection: 'column' },
		}),
		option: ({ isFocused }: { isFocused: boolean }): Partial<BoxProps> => ({
			style: { gap: 1, paddingLeft: isFocused ? 0 : 2 },
		}),
		selectedIndicator: (): Partial<TextProps> => ({
			style: { color: 'green' },
		}),
		focusIndicator: (): Partial<TextProps> => ({
			style: { color: 'blue' },
		}),
		label({
			isFocused,
			isSelected,
		}: {
			isFocused: boolean
			isSelected: boolean
		}): Partial<TextProps> {
			let color: string | undefined

			if (isSelected) {
				color = 'green'
			}

			if (isFocused) {
				color = 'blue'
			}

			return { style: { color } }
		},
		highlightedText: (): Partial<TextProps> => ({
			style: { fontWeight: 'bold' },
		}),
	},
}
//#endregion Theme

//#region Component
export function MultiSelectOption(props: IMultiSelectOptionProps): JSX.Element {
	const [local] = splitProps(props, ['isFocused', 'isSelected', 'children'])

	const theme = useComponentTheme<MultiSelectTheme>('MultiSelect')
	const { styles } = theme ?? multiSelectTheme

	return (
		<Box {...styles.option({ isFocused: local.isFocused })}>
			<Show when={local.isFocused}>
				<Text {...styles.focusIndicator()}>{figures.pointer}</Text>
			</Show>
			<Text
				{...styles.label({
					isFocused: local.isFocused,
					isSelected: local.isSelected,
				})}
			>
				{local.children}
			</Text>
			<Show when={local.isSelected}>
				<Text {...styles.selectedIndicator()}>{figures.tick}</Text>
			</Show>
		</Box>
	)
}
//#endregion Component
