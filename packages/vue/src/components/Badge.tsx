import {
	defineComponent,
	type PropType,
	type VNode,
	type DefineComponent,
} from 'vue'
import type { Styles } from '@wolfie/core'
import { Text, type TextProps } from './Text'

//#region Types
export interface BadgeProps {
	/**
	 * Label content.
	 */
	children?: VNode | VNode[] | string

	/**
	 * Color.
	 *
	 * @default "magenta"
	 */
	color?: Styles['color']
}

export type BadgeTheme = {
	styles: {
		container: (props: { color?: Styles['color'] }) => Partial<TextProps>
		label: () => Partial<TextProps>
	}
}
//#endregion Types

//#region Theme
export const badgeTheme: BadgeTheme = {
	styles: {
		container: ({ color }): Partial<TextProps> => ({
			style: {
				backgroundColor: color,
			},
		}),
		label: (): Partial<TextProps> => ({
			style: {
				color: 'black',
			},
		}),
	},
}
//#endregion Theme

//#region Helpers
function extractTextFromSlot(children: VNode[] | undefined): string | null {
	if (!children || children.length === 0) return null

	const firstChild = children[0]
	if (!firstChild) return null

	// Direct string in slot
	if (typeof firstChild === 'string') {
		return firstChild
	}

	// VNode with children property
	if (
		firstChild &&
		typeof firstChild === 'object' &&
		'children' in firstChild
	) {
		const nodeChildren = firstChild.children
		if (typeof nodeChildren === 'string') {
			return nodeChildren
		}
		// Handle array of children
		if (Array.isArray(nodeChildren) && nodeChildren.length > 0) {
			const text = nodeChildren[0]
			if (typeof text === 'string') {
				return text
			}
		}
	}

	return null
}
//#endregion Helpers

//#region Component
export const Badge: DefineComponent<{ color?: Styles['color'] }> =
	defineComponent({
		name: 'Badge',
		props: {
			color: {
				type: String as PropType<Styles['color']>,
				default: 'magenta',
			},
		},
		setup(props, { slots }) {
			return () => {
				const { color } = props
				const { styles } = badgeTheme

				const children = slots.default?.()
				const text = extractTextFromSlot(children)
				const displayContent: VNode[] | string | undefined = text
					? text.toUpperCase()
					: children

				const result = (
					<Text {...styles.container({ color })}>
						{' '}
						<Text {...styles.label()}>{displayContent}</Text>{' '}
					</Text>
				)
				return result
			}
		},
	})
//#endregion Component

export type { BadgeProps as Props, BadgeProps as IProps }
