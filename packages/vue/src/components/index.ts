import { defineComponent, h, type PropType, type VNode } from 'vue'
import { type Styles } from '@wolfie/core'

export interface BoxProps {
	readonly style?: Styles
	readonly className?: string
}

export const Box = defineComponent({
	name: 'Box',
	props: {
		style: {
			type: Object as PropType<Styles>,
			default: () => ({}),
		},
		className: {
			type: String as PropType<string>,
			default: '',
		},
	},
	setup(props, { slots }) {
		return () =>
			h(
				'wolfie-box',
				{ style: props.style, class: props.className },
				slots.default?.()
			)
	},
}) as unknown as new () => {
	$props: BoxProps
	$slots: {
		default?(): VNode[]
	}
}

export interface TextProps {
	readonly style?: Styles
	readonly className?: string
}

export const Text = defineComponent({
	name: 'Text',
	props: {
		style: {
			type: Object as PropType<Styles>,
			default: () => ({}),
		},
		className: {
			type: String as PropType<string>,
			default: '',
		},
	},
	setup(props, { slots }) {
		return () =>
			h(
				'wolfie-text',
				{ style: props.style, class: props.className },
				slots.default?.()
			)
	},
}) as unknown as new () => {
	$props: TextProps
	$slots: {
		default?(): VNode[]
	}
}
