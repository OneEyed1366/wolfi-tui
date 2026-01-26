import { defineComponent, type PropType } from 'vue'

//#region Types
export interface NewlineProps {
	/**
	 * Number of newlines to insert.
	 * @default 1
	 */
	count?: number
}
//#endregion Types

/**
 * Adds one or more newline (`\n`) characters. Must be used within `<Text>` components.
 */
export const Newline = defineComponent({
	name: 'Newline',
	props: {
		count: {
			type: Number as PropType<number>,
			default: 1,
		},
	},
	setup(props) {
		return () => {
			const count = props.count ?? 1
			return <wolfie-text>{'\n'.repeat(count)}</wolfie-text>
		}
	},
})

export type { NewlineProps as Props, NewlineProps as IProps }
