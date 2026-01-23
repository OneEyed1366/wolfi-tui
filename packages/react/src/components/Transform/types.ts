export type IProps = {
	/**
	Screen-reader-specific text to output. If this is set, all children will be ignored.
	*/
	accessibilityLabel?: string

	/**
	Function that transforms children output. It accepts children and must return transformed children as well.
	*/
	transform: (children: string, index: number) => string

	children?: React.ReactNode
}

export type Props = IProps
