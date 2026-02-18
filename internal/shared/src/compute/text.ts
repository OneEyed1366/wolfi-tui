import chalk from 'chalk'
import type { Styles } from '@wolfie/core'
import { colorize } from '@wolfie/core'
import type { ClassNameValue } from '../styles/registry'
import { resolveClassName } from '../styles/registry'

/**
 * Returns a transform function for a wolfie-text element.
 *
 * The returned function is assigned to `el.internal_transform` — the
 * wolfie renderer calls it on each text string before writing to terminal.
 *
 * Background inheritance: parentBg is the BACKGROUND_CONTEXT value injected
 * from the nearest ancestor Box that has a backgroundColor.
 */
export function computeTextTransform(
	props: { className?: ClassNameValue; style?: Partial<Styles> },
	parentBg?: string
): (text: string) => string {
	const resolvedClassName = resolveClassName(props.className)
	const effectiveStyles: Partial<Styles> = {
		...resolvedClassName,
		...(props.style ?? {}),
	}

	const effectiveColor = effectiveStyles.color
	const finalBg = effectiveStyles.backgroundColor ?? parentBg
	const effectiveBold = effectiveStyles.fontWeight === 'bold'
	const effectiveItalic = effectiveStyles.fontStyle === 'italic'
	const effectiveUnderline = effectiveStyles.textDecoration === 'underline'
	const effectiveStrikethrough =
		effectiveStyles.textDecoration === 'line-through'
	const effectiveInverse = effectiveStyles.inverse ?? false

	return (text: string): string => {
		let result = text
		if (effectiveColor) result = colorize(result, effectiveColor, 'foreground')
		if (finalBg) result = colorize(result, finalBg, 'background')
		if (effectiveBold) result = chalk.bold(result)
		if (effectiveItalic) result = chalk.italic(result)
		if (effectiveUnderline) result = chalk.underline(result)
		if (effectiveStrikethrough) result = chalk.strikethrough(result)
		if (effectiveInverse) result = chalk.inverse(result)
		return result
	}
}
