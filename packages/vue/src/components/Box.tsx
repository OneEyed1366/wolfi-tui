import { defineComponent, inject, provide, type PropType } from 'vue'
import type { Styles } from '@wolfie/core'
import { AccessibilitySymbol, BackgroundSymbol } from '../context/symbols'
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

/**
 * `<Box>` is an essential Wolfie component to build your layout.
 * It's like `<div style="display: flex">` in the browser.
 */
export const Box = defineComponent({
	name: 'Box',
	props: {
		className: {
			type: [String, Object, Array] as PropType<ClassNameValue>,
			default: undefined,
		},
		style: {
			type: Object as PropType<Styles>,
			default: () => ({}),
		},
		'aria-label': {
			type: String,
			default: undefined,
		},
		'aria-hidden': {
			type: Boolean,
			default: undefined,
		},
		'aria-role': {
			type: String as PropType<AriaRole>,
			default: undefined,
		},
		'aria-state': {
			type: Object as PropType<AriaState>,
			default: undefined,
		},
	},
	setup(props, { slots }) {
		const accessibility = inject(AccessibilitySymbol, {
			isScreenReaderEnabled: false,
		})
		const inheritedBackgroundColor = inject(BackgroundSymbol, undefined)

		return () => {
			const style = props.style ?? {}
			// Vue converts kebab-case props to camelCase internally
			const ariaLabel = (props as Record<string, unknown>).ariaLabel as
				| string
				| undefined
			const ariaHidden = (props as Record<string, unknown>).ariaHidden as
				| boolean
				| undefined
			const ariaRole = (props as Record<string, unknown>).ariaRole as
				| string
				| undefined
			const ariaState = (props as Record<string, unknown>).ariaState as
				| Record<string, boolean>
				| undefined

			const isScreenReaderEnabled = accessibility.isScreenReaderEnabled

			if (isScreenReaderEnabled && ariaHidden) {
				return null
			}

			const resolvedClassName = resolveClassName(props.className)

			const finalBackgroundColor =
				style.backgroundColor ?? resolvedClassName.backgroundColor

			const label = ariaLabel ? (
				<wolfie-text>{ariaLabel}</wolfie-text>
			) : undefined

			const boxElement = (
				<wolfie-box
					style={{
						backgroundColor: finalBackgroundColor ?? inheritedBackgroundColor,
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
						...defaultBoxStyles,
						...resolvedClassName,
						...style,
					}}
					internal_accessibility={{
						role: ariaRole,
						state: ariaState,
					}}
				>
					{isScreenReaderEnabled && label ? label : slots.default?.()}
				</wolfie-box>
			)

			if (finalBackgroundColor) {
				provide(BackgroundSymbol, finalBackgroundColor)
			}

			return boxElement
		}
	},
})

export type { BoxProps as Props, BoxProps as IProps }
