import { defineComponent, type VNode, type DefineComponent } from 'vue'
import figures from 'figures'
import { Box, type BoxProps } from './Box'
import { Text, type TextProps } from './Text'
import { useComponentTheme, type IComponentTheme } from '../theme'

//#region Types
export interface MultiSelectOptionProps {
	/**
	 * Determines if option is focused.
	 */
	isFocused: boolean

	/**
	 * Determines if option is selected.
	 */
	isSelected: boolean

	/**
	 * Option label.
	 */
	children?: VNode | VNode[] | string
}

export type MultiSelectTheme = IComponentTheme & {
	styles: {
		container: () => Partial<BoxProps>
		option: (props: { isFocused: boolean }) => Partial<BoxProps>
		selectedIndicator: () => Partial<TextProps>
		focusIndicator: () => Partial<TextProps>
		label: (props: {
			isFocused: boolean
			isSelected: boolean
		}) => Partial<TextProps>
		highlightedText: () => Partial<TextProps>
	}
}
//#endregion Types

//#region Theme
export const multiSelectTheme: MultiSelectTheme = {
	styles: {
		container: (): Partial<BoxProps> => ({
			style: {
				flexDirection: 'column',
			},
		}),
		option: ({ isFocused }: { isFocused: boolean }): Partial<BoxProps> => ({
			style: {
				gap: 1,
				paddingLeft: isFocused ? 0 : 2,
			},
		}),
		selectedIndicator: (): Partial<TextProps> => ({
			style: {
				color: 'green',
			},
		}),
		focusIndicator: (): Partial<TextProps> => ({
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
		}): Partial<TextProps> {
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
		highlightedText: (): Partial<TextProps> => ({
			style: {
				fontWeight: 'bold',
			},
		}),
	},
}
//#endregion Theme

//#region Component
export const MultiSelectOption: DefineComponent<MultiSelectOptionProps> =
	defineComponent({
		name: 'MultiSelectOption',
		props: {
			isFocused: {
				type: Boolean,
				required: true,
			},
			isSelected: {
				type: Boolean,
				required: true,
			},
		},
		setup(props, { slots }) {
			const theme = useComponentTheme<MultiSelectTheme>('MultiSelect')
			const { styles } = theme ?? multiSelectTheme

			return () => {
				return (
					<Box {...styles.option({ isFocused: props.isFocused })}>
						{props.isFocused && (
							<Text {...styles.focusIndicator()}>{figures.pointer}</Text>
						)}

						<Text
							{...styles.label({
								isFocused: props.isFocused,
								isSelected: props.isSelected,
							})}
						>
							{slots.default?.()}
						</Text>

						{props.isSelected && (
							<Text {...styles.selectedIndicator()}>{figures.tick}</Text>
						)}
					</Box>
				)
			}
		},
	})
//#endregion Component

export type {
	MultiSelectOptionProps as Props,
	MultiSelectOptionProps as IProps,
}
