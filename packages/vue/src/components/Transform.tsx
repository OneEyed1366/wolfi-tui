import { defineComponent, inject, type PropType } from 'vue'
import { AccessibilitySymbol } from '../context/symbols'

//#region Types
export interface TransformProps {
	/**
	 * Screen-reader-specific text to output. If this is set, all children will be ignored.
	 */
	accessibilityLabel?: string

	/**
	 * Function that transforms children output. It accepts children and must return transformed children as well.
	 */
	transform: (children: string, index: number) => string
}
//#endregion Types

/**
 * Transform a string representation of components before they're written to output.
 * For example, you might want to apply a gradient to text, add a clickable link,
 * or create some text effects. These use cases can't accept nodes as input;
 * they expect a string. That's what the <Transform> component does: it gives you
 * an output string of its child components and lets you transform it in any way.
 */
export const Transform = defineComponent({
	name: 'Transform',
	props: {
		accessibilityLabel: {
			type: String,
			default: undefined,
		},
		transform: {
			type: Function as PropType<(children: string, index: number) => string>,
			required: true,
		},
	},
	setup(props, { slots }) {
		const accessibility = inject(AccessibilitySymbol, {
			isScreenReaderEnabled: false,
		})

		return () => {
			const children = slots.default?.()

			if (children === undefined || children === null) {
				return null
			}

			const isScreenReaderEnabled = accessibility.isScreenReaderEnabled
			const content =
				isScreenReaderEnabled && props.accessibilityLabel
					? props.accessibilityLabel
					: children

			return (
				<wolfie-text internal_transform={props.transform}>
					{content}
				</wolfie-text>
			)
		}
	},
})

export type { TransformProps as Props, TransformProps as IProps }
