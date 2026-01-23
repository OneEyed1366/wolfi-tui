import React, { forwardRef, useContext, type PropsWithChildren } from 'react'
import { type DOMElement } from '@wolfie/core'
import { accessibilityContext } from '../../context/AccessibilityContext'
import { backgroundContext } from '../../context/BackgroundContext'
import { resolveClassName } from '../../styles/index'
import type { IProps } from './types'
import styles from './Box.module.css'

/**
`<Box>` is an essential Wolfie component to build your layout. It's like `<div style="display: flex">` in the browser.
*/
export const Box = forwardRef<DOMElement, PropsWithChildren<IProps>>(
	(
		{
			children,
			className,
			style = {},
			'aria-label': ariaLabel,
			'aria-hidden': ariaHidden,
			'aria-role': role,
			'aria-state': ariaState,
		},
		ref
	) => {
		const { isScreenReaderEnabled } = useContext(accessibilityContext)
		const label = ariaLabel ? (
			<wolwie_react-text>{ariaLabel}</wolwie_react-text>
		) : undefined
		if (isScreenReaderEnabled && ariaHidden) {
			return null
		}

		const resolvedClassName = resolveClassName(className)

		const boxElement = (
			<wolwie_react-box
				ref={ref}
				style={{
					backgroundColor:
						style.backgroundColor ?? resolvedClassName.backgroundColor,
					overflowX:
						style.overflowX ??
						resolvedClassName.overflowX ??
						style.overflow ??
						resolvedClassName.overflow ??
						'visible',
					overflowY:
						style.overflowY ??
						resolvedClassName.overflowY ??
						style.overflow ??
						resolvedClassName.overflow ??
						'visible',
					...styles.box,
					...resolvedClassName,
					...style,
				}}
				internal_accessibility={{
					role,
					state: ariaState,
				}}
			>
				{isScreenReaderEnabled && label ? label : children}
			</wolwie_react-box>
		)

		const finalBackgroundColor =
			style.backgroundColor ?? resolvedClassName.backgroundColor
		if (finalBackgroundColor) {
			return (
				<backgroundContext.Provider value={finalBackgroundColor}>
					{boxElement}
				</backgroundContext.Provider>
			)
		}

		return boxElement
	}
)

Box.displayName = 'Box'

export type { IProps as Props } from './types'
export type { IProps } from './types'
