import { useContext, type JSX } from 'solid-js'
import chalk from 'chalk'
import { colorize, type Styles } from '@wolfie/core'
import { AccessibilityCtx, BackgroundCtx } from '../context/symbols'
import { resolveClassName, type ClassNameValue } from '../styles'

//#region Types
export interface TextProps {
	className?: ClassNameValue
	style?: Styles
	'aria-label'?: string
	'aria-hidden'?: boolean
	children?: JSX.Element
}
//#endregion Types

export function Text(props: TextProps) {
	const accessibility = useContext(AccessibilityCtx)
	const inheritedBackgroundColor = useContext(BackgroundCtx)

	const effectiveStyles = (): Styles => {
		const resolved = resolveClassName(props.className)
		return { ...resolved, ...(props.style ?? {}) }
	}

	return (() => {
		const ariaLabel = props['aria-label']
		const ariaHidden = props['aria-hidden']
		const isScreenReaderEnabled = accessibility?.isScreenReaderEnabled
		const children =
			isScreenReaderEnabled && ariaLabel ? ariaLabel : props.children

		if (children === undefined || children === null) return null
		if (isScreenReaderEnabled && ariaHidden) return null

		const styles = effectiveStyles()

		const effectiveColor = styles.color
		const effectiveBackgroundColor = styles.backgroundColor
		const effectiveBold = styles.fontWeight === 'bold'
		const effectiveItalic = styles.fontStyle === 'italic'
		const effectiveUnderline = styles.textDecoration === 'underline'
		const effectiveStrikethrough = styles.textDecoration === 'line-through'
		const effectiveInverse = styles.inverse ?? false
		const effectiveWrap = styles.textWrap ?? 'wrap'

		const transform = (text: string): string => {
			let result = text

			if (effectiveColor) {
				result = colorize(result, effectiveColor, 'foreground')
			}

			const finalBackgroundColor =
				effectiveBackgroundColor ?? inheritedBackgroundColor?.()
			if (finalBackgroundColor) {
				result = colorize(result, finalBackgroundColor, 'background')
			}

			if (effectiveBold) result = chalk.bold(result)
			if (effectiveItalic) result = chalk.italic(result)
			if (effectiveUnderline) result = chalk.underline(result)
			if (effectiveStrikethrough) result = chalk.strikethrough(result)
			if (effectiveInverse) result = chalk.inverse(result)

			return result
		}

		return (
			<wolfie-text
				style={{ ...styles, textWrap: effectiveWrap }}
				internal_transform={transform}
			>
				{children}
			</wolfie-text>
		)
	})()
}

export type { TextProps as Props, TextProps as IProps }
