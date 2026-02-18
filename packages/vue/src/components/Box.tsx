import {
	defineComponent,
	inject,
	provide,
	computed,
	unref,
	type PropType,
} from 'vue'
import type { Styles } from '@wolfie/core'
import {
	computeBoxStyle,
	computeBoxBackground,
	type ClassNameValue,
} from '@wolfie/shared'
import { AccessibilitySymbol, BackgroundSymbol } from '../context/symbols'

//#region Types
import type { AriaRole, AriaState } from '@wolfie/shared'

export interface BoxProps {
	className?: ClassNameValue
	style?: Styles
	'aria-label'?: string
	'aria-hidden'?: boolean
	'aria-role'?: AriaRole
	'aria-state'?: AriaState
}
//#endregion Types

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
		const computedBackgroundColor = computed(() =>
			computeBoxBackground(
				{
					className: (attrs.class ?? props.className) as ClassNameValue,
					style: props.style,
				},
				unref(inheritedBackgroundColorRef)
			)
		)

		// Provide background color to children — pass through inherited value when no
		// explicit value, so children can inherit from grandparent
		provide(BackgroundSymbol, computedBackgroundColor)

		return () => {
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

			const finalStyle = computeBoxStyle(
				{
					className: (attrs.class ?? props.className) as ClassNameValue,
					style: props.style,
				},
				unref(inheritedBackgroundColorRef)
			)

			const label = ariaLabel ? (
				<wolfie-text>{ariaLabel}</wolfie-text>
			) : undefined
			return (
				<wolfie-box
					style={finalStyle}
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
