import React, { useContext, type ReactNode } from 'react'
import chalk, { type ForegroundColorName } from 'chalk'
import { type LiteralUnion } from 'type-fest'
import { colorize, type Styles } from '@wolfie/core'
import { accessibilityContext } from './AccessibilityContext'
import { backgroundContext } from './BackgroundContext'
import { resolveClassName, type ClassNameValue } from '../styles/index.js'

export type Props = {
	/**
	CSS-like class name for styling. Supports:
	- String class name: 'text-bold'
	- Space-separated classes: 'text-red underline'
	- Style object (from CSS Modules): { color: 'red' }
	- Array of the above: ['base', { bold: true }]

	The inline props take precedence over className when both are provided.
	*/
	readonly className?: ClassNameValue
	/**
	A label for the element for screen readers.
	*/
	readonly 'aria-label'?: string

	/**
	Hide the element from screen readers.
	*/
	readonly 'aria-hidden'?: boolean

	/**
	Change text color. Ink uses Chalk under the hood, so all its functionality is supported.
	*/
	readonly color?: LiteralUnion<ForegroundColorName, string>

	/**
	Same as `color`, but for the background.
	*/
	readonly backgroundColor?: LiteralUnion<ForegroundColorName, string>

	/**
	Dim the color (make it less bright).
	*/
	readonly dimColor?: boolean

	/**
	Make the text bold.
	*/
	readonly bold?: boolean

	/**
	Make the text italic.
	*/
	readonly italic?: boolean

	/**
	Make the text underlined.
	*/
	readonly underline?: boolean

	/**
	Make the text crossed out with a line.
	*/
	readonly strikethrough?: boolean

	/**
	Inverse background and foreground colors.
	*/
	readonly inverse?: boolean

	/**
	This property tells Ink to wrap or truncate text if its width is larger than the container. If `wrap` is passed (the default), Ink will wrap text and split it into multiple lines. If `truncate-*` is passed, Ink will truncate text instead, resulting in one line of text with the rest cut off.
	*/
	readonly wrap?: Styles['textWrap']

	readonly children?: ReactNode
}

/**
This component can display text and change its style to make it bold, underlined, italic, or strikethrough.
*/
export default function Text({
	className,
	color,
	backgroundColor,
	dimColor,
	bold,
	italic,
	underline,
	strikethrough,
	inverse,
	wrap,
	children,
	'aria-label': ariaLabel,
	'aria-hidden': ariaHidden = false,
}: Props) {
	const { isScreenReaderEnabled } = useContext(accessibilityContext)
	const inheritedBackgroundColor = useContext(backgroundContext)
	const childrenOrAriaLabel =
		isScreenReaderEnabled && ariaLabel ? ariaLabel : children

	if (childrenOrAriaLabel === undefined || childrenOrAriaLabel === null) {
		return null
	}

	// Resolve className styles and merge with explicit props (explicit props win)
	const resolvedClassName = resolveClassName(className)

	// Merge className styles with explicit props - explicit props override
	// Note: Styles type has backgroundColor but not color (color is a Text-specific prop)
	const effectiveColor = color
	const effectiveBackgroundColor =
		backgroundColor ??
		(resolvedClassName.backgroundColor as typeof backgroundColor)
	const effectiveDimColor = dimColor ?? false
	const effectiveBold = bold ?? false
	const effectiveItalic = italic ?? false
	const effectiveUnderline = underline ?? false
	const effectiveStrikethrough = strikethrough ?? false
	const effectiveInverse = inverse ?? false
	const effectiveWrap = wrap ?? (resolvedClassName.textWrap as typeof wrap) ?? 'wrap'

	const transform = (children: string): string => {
		if (effectiveDimColor) {
			children = chalk.dim(children)
		}

		if (effectiveColor) {
			children = colorize(children, effectiveColor, 'foreground')
		}

		// Use explicit backgroundColor if provided, otherwise use inherited from parent Box
		const finalBackgroundColor =
			effectiveBackgroundColor ?? inheritedBackgroundColor
		if (finalBackgroundColor) {
			children = colorize(children, finalBackgroundColor, 'background')
		}

		if (effectiveBold) {
			children = chalk.bold(children)
		}

		if (effectiveItalic) {
			children = chalk.italic(children)
		}

		if (effectiveUnderline) {
			children = chalk.underline(children)
		}

		if (effectiveStrikethrough) {
			children = chalk.strikethrough(children)
		}

		if (effectiveInverse) {
			children = chalk.inverse(children)
		}

		return children
	}

	if (isScreenReaderEnabled && ariaHidden) {
		return null
	}

	return (
		<ink-text
			style={{
				flexGrow: 0,
				flexShrink: 1,
				flexDirection: 'row',
				textWrap: effectiveWrap,
				...resolvedClassName,
			}}
			internal_transform={transform}
		>
			{isScreenReaderEnabled && ariaLabel ? ariaLabel : children}
		</ink-text>
	)
}
