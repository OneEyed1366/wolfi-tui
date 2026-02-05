import {
	defineComponent,
	inject,
	provide,
	computed,
	unref,
	type PropType,
} from 'vue'
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
	inheritAttrs: false,
	setup(props, { slots, attrs }) {
		const accessibility = inject(AccessibilitySymbol, {
			isScreenReaderEnabled: false,
		})
		const inheritedBackgroundColorRef = inject(BackgroundSymbol, undefined)

		// Compute background color reactively for provide (must be in setup, not render)
		const computedBackgroundColor = computed(() => {
			const style = props.style ?? {}
			const mergedClassName = attrs.class ?? props.className
			const resolvedClassName = resolveClassName(
				mergedClassName as ClassNameValue
			)
			return style.backgroundColor ?? resolvedClassName.backgroundColor
		})

		// Provide background color to children (called in setup, not render)
		// Pass through inherited value when no explicit value, so children can inherit from grandparent
		const providedBackgroundColor = computed(
			() => computedBackgroundColor.value ?? unref(inheritedBackgroundColorRef)
		)
		provide(BackgroundSymbol, providedBackgroundColor)

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

			// Merge attrs.class with props.className (attrs.class takes precedence for Vue SFC usage)
			const mergedClassName = attrs.class ?? props.className
			const resolvedClassName = resolveClassName(
				mergedClassName as ClassNameValue
			)

			const finalBackgroundColor = computedBackgroundColor.value

			const label = ariaLabel ? (
				<wolfie-text>{ariaLabel}</wolfie-text>
			) : undefined

			return (
				<wolfie-box
					style={{
						backgroundColor: finalBackgroundColor,
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
		}
	},
})

export type { BoxProps as Props, BoxProps as IProps }
