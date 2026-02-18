import React, { useContext } from 'react'
import { type Styles } from '@wolfie/core'
import { computeTextTransform, resolveClassName } from '@wolfie/shared'
import { accessibilityContext } from '../../context/AccessibilityContext'
import { backgroundContext } from '../../context/BackgroundContext'
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
	const effectiveWrap =
		(style as Partial<Styles>).textWrap ?? resolvedClassName.textWrap ?? 'wrap'

	const transform = computeTextTransform(
		{ className, style: style as Partial<Styles> },
		inheritedBackgroundColor ?? undefined
	)

	if (isScreenReaderEnabled && ariaHidden) {
		return null
	}

	return (
		<wolfie-text
			style={{
				...resolvedClassName,
				...style,
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
