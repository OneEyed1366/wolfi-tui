export type IProps<T> = {
	/**
	Array of items of any type to render using the function you pass as a component child.
	*/
	items: T[]

	/**
	Styles to apply to a container of child elements. See <Box> for supported properties.
	*/
	style?: import('@wolfie/core').Styles

	/**
	Function that is called to render every item in the `items` array. The first argument is the item itself, and the second argument is the index of that item in the `items` array. Note that a `key` must be assigned to the root component.
	*/
	children: (item: T, index: number) => React.ReactNode
}

export type Props<T> = IProps<T>
