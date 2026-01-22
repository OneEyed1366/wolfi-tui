import React, { useContext, type ReactNode } from 'react'
import chalk, { type ForegroundColorName } from 'chalk'
import { type LiteralUnion } from 'type-fest'
import { colorize, type Styles } from '@wolfie/core'
import { accessibilityContext } from './AccessibilityContext'
import { backgroundContext } from './BackgroundContext'
import { resolveClassName, type ClassNameValue } from '../styles/index'

export type Props = {
	/**
	CSS-like class name for styling. Supports:
	- String class name: 'text-bold'
	- Space-separated classes: 'text-red underline'
	- Style object (from CSS Modules): { color: 'red' }
	- Array of the above: ['base', { bold: true }]

	The inline style prop takes precedence over className when both are provided.
	*/
	readonly className?: ClassNameValue

	/**
	CSS-like inline styles.
	*/
	readonly style?: Styles

	/**
	A label for the element for screen readers.
	*/
	readonly 'aria-label'?: string

	/**
	Hide the element from screen readers.
	*/
	readonly 'aria-hidden'?: boolean

	readonly children?: ReactNode
}

/**
This component can display text and change its style to make it bold, underlined, italic, or strikethrough.
*/
export default function Text({
	className,
	style = {},
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

	// Resolve className styles and merge with explicit style prop (style prop wins)
	const resolvedClassName = resolveClassName(className)

	// Merge className styles with explicit style prop - style prop overrides
	const effectiveStyles: Styles = {
		...resolvedClassName,
		...style,
	}

	const effectiveColor = effectiveStyles.color
	const effectiveBackgroundColor = effectiveStyles.backgroundColor
	const effectiveBold = effectiveStyles.fontWeight === 'bold'
	const effectiveItalic = effectiveStyles.fontStyle === 'italic'
	const effectiveUnderline = effectiveStyles.textDecoration === 'underline'
	const effectiveStrikethrough =
		effectiveStyles.textDecoration === 'line-through'
	const effectiveInverse = effectiveStyles.inverse ?? false
	const effectiveWrap = effectiveStyles.textWrap ?? 'wrap'

	const transform = (children: string): string => {
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
				...effectiveStyles,
				textWrap: effectiveWrap,
			}}
			internal_transform={transform}
		>
			{isScreenReaderEnabled && ariaLabel ? ariaLabel : children}
		</ink-text>
	)
}
