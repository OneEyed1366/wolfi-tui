import type { ClassNameValue } from '../../styles/index'

export type IProps = {
	/**
	CSS-like class name for styling. Supports:
	- String class name: 'text-bold'
	- Space-separated classes: 'text-red underline'
	- Style object (from CSS Modules): { color: 'red' }
	- Array of the above: ['base', { bold: true }]

	The inline style prop takes precedence over className when both are provided.
	*/
	className?: ClassNameValue

	/**
	CSS-like inline styles.
	*/
	style?: import('@wolfie/core').Styles

	/**
	A label for the element for screen readers.
	*/
	'aria-label'?: string

	/**
	Hide the element from screen readers.
	*/
	'aria-hidden'?: boolean

	children?: React.ReactNode
}

export type Props = IProps
