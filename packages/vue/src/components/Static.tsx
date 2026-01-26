import { defineComponent, ref, watch, type PropType, type VNode } from 'vue'
import type { Styles } from '@wolfie/core'

//#region Types
export interface StaticProps<T> {
	/**
	 * Array of items of any type to render using the scoped slot.
	 */
	items: T[]

	/**
	 * Styles to apply to a container of child elements. See <Box> for supported properties.
	 */
	style?: Styles
}
//#endregion Types

//#region Default Styles
const staticStyles: Partial<Styles> = {
	position: 'absolute',
	flexDirection: 'column',
}
//#endregion Default Styles

/**
 * `<Static>` component permanently renders its output above everything else.
 * It's useful for displaying activity like completed tasks or logs—things that
 * don't change after they're rendered (hence the name "Static").
 *
 * It's preferred to use `<Static>` for use cases like these when you can't know
 * or control the number of items that need to be rendered.
 *
 * For example, Tap uses `<Static>` to display a list of completed tests.
 * Gatsby uses it to display a list of generated pages while still displaying a live progress bar.
 */
export const Static = defineComponent({
	name: 'Static',
	props: {
		items: {
			type: Array as PropType<unknown[]>,
			required: true,
		},
		style: {
			type: Object as PropType<Styles>,
			default: undefined,
		},
	},
	setup(props, { slots }) {
		const index = ref(0)

		watch(
			() => props.items.length,
			(newLength) => {
				index.value = newLength
			},
			{ flush: 'sync' }
		)

		return () => {
			const itemsToRender = props.items.slice(index.value)

			const children: VNode[] = itemsToRender.map((item, itemIndex) => {
				const slotContent = slots.default?.({
					item,
					index: index.value + itemIndex,
				})
				return slotContent as unknown as VNode
			})

			const finalStyle: Styles = {
				...staticStyles,
				...props.style,
			}

			return (
				<wolfie-box internal_static style={finalStyle}>
					{children}
				</wolfie-box>
			)
		}
	},
})

export type { StaticProps as Props, StaticProps as IProps }
