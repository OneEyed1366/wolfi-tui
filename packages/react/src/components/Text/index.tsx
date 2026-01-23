import React, { useContext } from 'react'
import chalk from 'chalk'
import { colorize, type Styles } from '@wolfie/core'
import { accessibilityContext } from '../../context/AccessibilityContext'
import { backgroundContext } from '../../context/BackgroundContext'
import { resolveClassName } from '../../styles/index'
import type { IProps } from './types'

/**
This component can display text and change its style to make it bold, underlined, italic, or strikethrough.
*/
export function Text({
	className,
	style = {},
	children,
	'aria-label': ariaLabel,
	'aria-hidden': ariaHidden = false,
}: IProps) {
	const { isScreenReaderEnabled } = useContext(accessibilityContext)
	const inheritedBackgroundColor = useContext(backgroundContext)
	const childrenOrAriaLabel =
		isScreenReaderEnabled && ariaLabel ? ariaLabel : children

	if (childrenOrAriaLabel === undefined || childrenOrAriaLabel === null) {
		return null
	}

	const resolvedClassName = resolveClassName(className)

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
		<wolfie-text
			style={{
				...effectiveStyles,
				textWrap: effectiveWrap,
			}}
			internal_transform={transform}
		>
			{isScreenReaderEnabled && ariaLabel ? ariaLabel : children}
		</wolfie-text>
	)
}

export type { IProps as Props } from './types'
export type { IProps } from './types'
