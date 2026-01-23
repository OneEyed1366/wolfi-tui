import type { ParsedStyles } from './types'

/**
 * Unified utility to inline CSS classes into JSX style props.
 * Handles both Record-based and Map-based style storage.
 * Safely merges with existing style props and removes className if fully resolved.
 */
export function inlineStyles(
	code: string,
	styles: ParsedStyles | Map<string, any>
): string {
	// Match opening tags that have a className attribute
	// We use a regex that matches from < to > and must contain className
	// We use [^>]* to stay within the same tag
	return code.replace(
		/<[a-zA-Z0-9.]+\s+[^>]*?className\s*=\s*["'][^"']+["'][^>]*?>/g,
		(tag) => {
			let currentTag = tag

			const classNameMatch = currentTag.match(
				/className\s*=\s*(["'])([^"']+)\1/
			)
			if (!classNameMatch) return tag

			const [fullClassMatch, , classList] = classNameMatch
			const classes = (classList as string).split(/\s+/).filter(Boolean)
			const toInline: Record<string, any> = {}
			let allResolved = true

			for (const cls of classes) {
				const camelCls = cls.replace(/-([a-z])/g, (_, l) => l.toUpperCase())
				const style =
					styles instanceof Map
						? styles.get(cls) || styles.get(camelCls)
						: styles[cls] || styles[camelCls]

				if (style) {
					Object.assign(toInline, style)
				} else {
					allResolved = false
				}
			}

			if (Object.keys(toInline).length === 0) return tag

			// Check for existing style prop
			// Matches style={{ ... }}
			const styleRegex = /style\s*=\s*\{\s*(\{[\s\S]*?\})\s*\}/
			const styleMatch = currentTag.match(styleRegex)

			if (styleMatch) {
				try {
					const existingStyleStr = styleMatch[1]!
					// Safe eval of the object literal to handle non-strict JSON
					// eslint-disable-next-line no-new-func
					const existingStyle = new Function(`return ${existingStyleStr}`)()
					const merged = { ...toInline, ...existingStyle }
					currentTag = currentTag.replace(
						styleMatch[0]!,
						`style={${JSON.stringify(merged)}}`
					)
				} catch {
					// If we can't parse it (e.g. dynamic variable), we skip merging for this tag
					// to avoid producing invalid JSX.
					return tag
				}
			} else {
				// No existing style, add it before the closing > or />
				const isSelfClosing = currentTag.endsWith('/>')
				const insertPos = isSelfClosing
					? currentTag.length - 2
					: currentTag.length - 1
				currentTag =
					currentTag.slice(0, insertPos).trimEnd() +
					` style={${JSON.stringify(toInline)}}` +
					(isSelfClosing ? ' />' : '>')
			}

			if (allResolved) {
				// Remove className
				currentTag = currentTag.replace(fullClassMatch, '')
			}

			// Final cleanup of whitespace inside the tag
			return currentTag
				.replace(/\s+/g, ' ')
				.replace(/\s+>/, '>')
				.replace(/\s+\/>/, ' />')
		}
	)
}
