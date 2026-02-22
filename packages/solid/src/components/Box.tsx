import { useContext, type JSX } from 'solid-js'
import type { Styles } from '@wolfie/core'
import { AccessibilityCtx, BackgroundCtx } from '../context/symbols'
import { resolveClassName, type ClassNameValue } from '../styles'

//#region Types
type AriaRole =
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

type AriaState = {
	busy?: boolean
	checked?: boolean
	disabled?: boolean
	expanded?: boolean
	multiline?: boolean
	multiselectable?: boolean
	readonly?: boolean
	required?: boolean
	selected?: boolean
}

export interface BoxProps {
	className?: ClassNameValue
	style?: Styles
	'aria-label'?: string
	'aria-hidden'?: boolean
	'aria-role'?: AriaRole
	'aria-state'?: AriaState
	children?: JSX.Element
}
//#endregion Types

//#region Default Styles
const defaultBoxStyles: Partial<Styles> = {
	flexWrap: 'nowrap',
	flexDirection: 'row',
	flexGrow: 0,
	flexShrink: 1,
}
//#endregion Default Styles

export function Box(props: BoxProps) {
	const accessibility = useContext(AccessibilityCtx)
	const inheritedBackgroundColor = useContext(BackgroundCtx)

	const resolvedStyles = () => {
		const style = props.style ?? {}
		const resolved = resolveClassName(props.className)
		return { ...resolved, ...style }
	}

	const backgroundColor = () => {
		const s = resolvedStyles()
		return s.backgroundColor ?? inheritedBackgroundColor?.()
	}

	return (
		<BackgroundCtx.Provider value={backgroundColor}>
			{(() => {
				const isScreenReaderEnabled = accessibility?.isScreenReaderEnabled
				const ariaLabel = props['aria-label']
				const ariaHidden = props['aria-hidden']
				const ariaRole = props['aria-role']
				const ariaState = props['aria-state']

				if (isScreenReaderEnabled && ariaHidden) {
					return null
				}

				const style = resolvedStyles()
				const bgColor = backgroundColor()

				const label = ariaLabel ? (
					<wolfie-text>{ariaLabel}</wolfie-text>
				) : undefined

				return (
					<wolfie-box
						style={{
							backgroundColor: bgColor,
							overflowX: style.overflowX ?? style.overflow ?? 'visible',
							overflowY: style.overflowY ?? style.overflow ?? 'visible',
							...defaultBoxStyles,
							...style,
						}}
						internal_accessibility={{
							role: ariaRole,
							state: ariaState,
						}}
					>
						{isScreenReaderEnabled && label ? label : props.children}
					</wolfie-box>
				)
			})()}
		</BackgroundCtx.Provider>
	)
}

export type { BoxProps as Props, BoxProps as IProps }
