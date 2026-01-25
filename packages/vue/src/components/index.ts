import { defineComponent, h, type PropType } from 'vue'
import type { Styles } from '@wolfie/core'

export const Box = defineComponent({
	name: 'WolfieBox',
	displayName: 'Box',
	props: {
		style: {
			type: Object as PropType<Styles>,
			default: () => ({}),
		},
	},
	setup(props, { slots }) {
		return () => h('wolfie-box', { style: props.style }, slots.default?.())
	},
})

export const Text = defineComponent({
	name: 'WolfieText',
	displayName: 'Text',
	props: {
		style: {
			type: Object as PropType<Styles>,
			default: () => ({}),
		},
	},
	setup(props, { slots }) {
		return () => h('wolfie-text', { style: props.style }, slots.default?.())
	},
})
