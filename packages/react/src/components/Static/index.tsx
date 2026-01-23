import React, { useMemo, useState, useLayoutEffect } from 'react'
import { type Styles } from '@wolfie/core'
import type { IProps } from './types'
import styles from './Static.module.css'
/**
`<Static>` component permanently renders its output above everything else. It's useful for displaying activity like completed tasks or logs—things that don't change after they're rendered (hence the name "Static").

It's preferred to use `<Static>` for use cases like these when you can't know or control the number of items that need to be rendered.

For example, [Tap](https://github.com/tapjs/node-tap) uses `<Static>` to display a list of completed tests. [Gatsby](https://github.com/gatsbyjs/gatsby) uses it to display a list of generated pages while still displaying a live progress bar.
*/
export function Static<T>(props: IProps<T>) {
	const { items, children: render, style: customStyle } = props
	const [index, setIndex] = useState(0)

	const itemsToRender: T[] = useMemo(() => {
		return items.slice(index)
	}, [items, index])

	useLayoutEffect(() => {
		setIndex(items.length)
	}, [items.length])

	const children = itemsToRender.map((item, itemIndex) => {
		return render(item, index + itemIndex)
	})

	const style: Styles = useMemo(
		() => ({
			...styles.static,
			...customStyle,
		}),
		[customStyle]
	)

	return (
		<wolwie_react-box internal_static style={style}>
			{children}
		</wolwie_react-box>
	)
}

export type { IProps as Props } from './types'
export type { IProps } from './types'
