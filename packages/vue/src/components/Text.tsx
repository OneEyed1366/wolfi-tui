import { defineComponent, inject, unref, type PropType } from 'vue'
import type { Styles } from '@wolfie/core'
import {
	computeTextTransform,
	resolveClassName,
	type ClassNameValue,
} from '@wolfie/shared'
import { AccessibilitySymbol, BackgroundSymbol } from '../context/symbols'

//#region Types
export interface TextProps {
	className?: ClassNameValue
	style?: Styles
	'aria-label'?: string
	'aria-hidden'?: boolean
}
//#endregion Types

/**
 * This component can display text and change its style to make it bold, underlined, italic, or strikethrough.
 */
export const Text = defineComponent({
	name: 'Text',
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
			default: false,
		},
	},
	inheritAttrs: false,
	setup(props, { slots, attrs }) {
		const accessibility = inject(AccessibilitySymbol, {
			isScreenReaderEnabled: false,
		})
		const inheritedBackgroundColorRef = inject(BackgroundSymbol, undefined)

		return () => {
			const style = props.style ?? {}
			// Vue converts kebab-case props to camelCase internally
			const ariaLabel = (props as Record<string, unknown>).ariaLabel as
				| string
				| undefined
			const ariaHidden = (props as Record<string, unknown>).ariaHidden as
				| boolean
				| undefined

			const isScreenReaderEnabled = accessibility.isScreenReaderEnabled
			const children = slots.default?.()
			const childrenOrAriaLabel =
				isScreenReaderEnabled && ariaLabel ? ariaLabel : children

			if (childrenOrAriaLabel === undefined || childrenOrAriaLabel === null) {
				return null
			}

			if (isScreenReaderEnabled && ariaHidden) {
				return null
			}

			// Merge attrs.class with props.className (attrs.class takes precedence for Vue SFC usage)
			const mergedClassName = (attrs.class ?? props.className) as ClassNameValue
			const resolvedClassName = resolveClassName(mergedClassName)
			const effectiveWrap =
				(style as Partial<Styles>).textWrap ??
				resolvedClassName.textWrap ??
				'wrap'

			const transform = computeTextTransform(
				{ className: mergedClassName, style: style as Partial<Styles> },
				unref(inheritedBackgroundColorRef)
			)

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
	},
})

export type { TextProps as Props, TextProps as IProps }
