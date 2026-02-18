import type { Styles } from '@wolfie/core'
import type { ClassNameValue } from '../styles/registry'
import { resolveClassName } from '../styles/registry'

export const DEFAULT_BOX_STYLES: Partial<Styles> = {
	flexWrap: 'nowrap',
	flexDirection: 'row',
	flexGrow: 0,
	flexShrink: 1,
}

/**
 * Computes the final style object for a Box component.
 *
 * Merge order (later wins):
 *   DEFAULT_BOX_STYLES → resolvedClassName → explicit style props
 *
 * Special cases:
 * - backgroundColor: own > parentBg (for context inheritance)
 * - overflow: shorthand expands to overflowX/Y; explicit X/Y overrides shorthand
 */
export function computeBoxStyle(
	props: { className?: ClassNameValue; style?: Partial<Styles> },
	parentBg?: string
): Partial<Styles> {
	const resolvedClassName = resolveClassName(props.className)
	const style = props.style ?? {}

	return {
		backgroundColor:
			style.backgroundColor ?? resolvedClassName.backgroundColor ?? parentBg,
		overflowX:
			style.overflowX ??
			resolvedClassName.overflowX ??
			(style as any).overflow ??
			resolvedClassName.overflow ??
			'visible',
		overflowY:
			style.overflowY ??
			resolvedClassName.overflowY ??
			(style as any).overflow ??
			resolvedClassName.overflow ??
			'visible',
		...DEFAULT_BOX_STYLES,
		...resolvedClassName,
		...style,
	}
}

/**
 * Resolves what background color a Box should PROVIDE to its children.
 * This is used to populate the background context token.
 *
 * Priority: own backgroundColor > parentBg > undefined
 */
export function computeBoxBackground(
	props: { className?: ClassNameValue; style?: Partial<Styles> },
	parentBg?: string
): string | undefined {
	const resolvedClassName = resolveClassName(props.className)
	const style = props.style ?? {}
	return style.backgroundColor ?? resolvedClassName.backgroundColor ?? parentBg
}
