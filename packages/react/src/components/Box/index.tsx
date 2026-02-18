import React, { forwardRef, useContext, type PropsWithChildren } from 'react'
import { type DOMElement } from '@wolfie/core'
import { computeBoxStyle, computeBoxBackground } from '@wolfie/shared'
import { accessibilityContext } from '../../context/AccessibilityContext'
import { backgroundContext } from '../../context/BackgroundContext'
import type { IProps } from './types'

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
		const label = ariaLabel ? <wolfie-text>{ariaLabel}</wolfie-text> : undefined
		if (isScreenReaderEnabled && ariaHidden) {
			return null
		}

		const finalStyle = computeBoxStyle({ className, style })
		const finalBg = computeBoxBackground({ className, style })

		const boxElement = (
			<wolfie-box
				ref={ref}
				style={finalStyle}
				internal_accessibility={{
					role,
					state: ariaState,
				}}
			>
				{isScreenReaderEnabled && label ? label : children}
			</wolfie-box>
		)

		if (finalBg) {
			return (
				<backgroundContext.Provider value={finalBg}>
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
