import React, { forwardRef, useContext, type PropsWithChildren } from 'react'
import { type Except } from 'type-fest'
import { type Styles, type DOMElement } from '@wolfie/core'
import { accessibilityContext } from './AccessibilityContext'
import { backgroundContext } from './BackgroundContext'
import { resolveClassName, type ClassNameValue } from '../styles/index'

export type Props = {
	/**
	CSS-like class name for styling. Supports:
	- String class name: 'container'
	- Space-separated classes: 'flex gap-2'
	- Style object (from CSS Modules): { padding: 2 }
	- Array of the above: ['base', { gap: 4 }]

	The `style` prop takes precedence over className when both are provided.
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

	/**
	The role of the element.
	*/
	readonly 'aria-role'?:
		| 'button'
		| 'checkbox'
		| 'combobox'
		| 'list'
		| 'listbox'
		| 'listitem'
		| 'menu'
		| 'menuitem'
		| 'option'
		| 'progressbar'
		| 'radio'
		| 'radiogroup'
		| 'tab'
		| 'tablist'
		| 'table'
		| 'textbox'
		| 'timer'
		| 'toolbar'

	/**
	The state of the element.
	*/
	readonly 'aria-state'?: {
		readonly busy?: boolean
		readonly checked?: boolean
		readonly disabled?: boolean
		readonly expanded?: boolean
		readonly multiline?: boolean
		readonly multiselectable?: boolean
		readonly readonly?: boolean
		readonly required?: boolean
		readonly selected?: boolean
	}
}

/**
`<Box>` is an essential Ink component to build your layout. It's like `<div style="display: flex">` in the browser.
*/
const Box = forwardRef<DOMElement, PropsWithChildren<Props>>(
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
		const label = ariaLabel ? <ink-text>{ariaLabel}</ink-text> : undefined
		if (isScreenReaderEnabled && ariaHidden) {
			return null
		}

		// Resolve className and merge with inline styles (inline styles win)
		const resolvedClassName = resolveClassName(className)

		const boxElement = (
			<ink-box
				ref={ref}
				style={{
					// LAYER 1: Defaults (lowest priority)
					flexWrap: 'nowrap',
					flexDirection: 'row',
					flexGrow: 0,
					flexShrink: 1,

					// LAYER 2: className styles (medium priority)
					...resolvedClassName,

					// LAYER 3: Inline style prop (highest priority)
					...style,

					// Special handling for derived properties
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
				}}
				internal_accessibility={{
					role,
					state: ariaState,
				}}
			>
				{isScreenReaderEnabled && label ? label : children}
			</ink-box>
		)

		// If this Box has a background color, provide it to children via context
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

export default Box
