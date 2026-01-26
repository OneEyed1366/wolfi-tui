import { defineComponent, inject, type PropType } from 'vue'
import chalk from 'chalk'
import { colorize, type Styles } from '@wolfie/core'
import { AccessibilitySymbol, BackgroundSymbol } from '../context/symbols'
import { resolveClassName, type ClassNameValue } from '../styles'

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

			const resolvedClassName = resolveClassName(props.className)

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

			const transform = (text: string): string => {
				let result = text

				if (effectiveColor) {
					result = colorize(result, effectiveColor, 'foreground')
				}

				const finalBackgroundColor =
					effectiveBackgroundColor ?? inheritedBackgroundColor
				if (finalBackgroundColor) {
					result = colorize(result, finalBackgroundColor, 'background')
				}

				if (effectiveBold) {
					result = chalk.bold(result)
				}

				if (effectiveItalic) {
					result = chalk.italic(result)
				}

				if (effectiveUnderline) {
					result = chalk.underline(result)
				}

				if (effectiveStrikethrough) {
					result = chalk.strikethrough(result)
				}

				if (effectiveInverse) {
					result = chalk.inverse(result)
				}

				return result
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
	},
})

export type { TextProps as Props, TextProps as IProps }
