import { createSignal, createComputed, For, type JSX } from 'solid-js'
import type { Styles } from '@wolfie/core'

//#region Types
export interface StaticProps<T> {
	items: T[]
	style?: Styles
	children: (item: T, index: number) => JSX.Element
}
//#endregion Types

//#region Default Styles
const staticStyles: Partial<Styles> = {
	position: 'absolute',
	flexDirection: 'column',
}
//#endregion Default Styles

export function Static<T>(props: StaticProps<T>) {
	const [index, setIndex] = createSignal(0)

	// Track items length changes synchronously
	createComputed(() => {
		setIndex(props.items.length)
	})

	const itemsToRender = () => props.items.slice(index())

	return (
		<wolfie-box internal_static style={{ ...staticStyles, ...props.style }}>
			<For each={itemsToRender()}>
				{(item, i) => props.children(item, index() + i())}
			</For>
		</wolfie-box>
	)
}

export type { StaticProps as Props, StaticProps as IProps }
