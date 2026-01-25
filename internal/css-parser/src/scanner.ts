/**
 * Simple regex-based scanner to find candidate class names in source code.
 * Matches:
 * - className="static-class" (React)
 * - class="static-class" (Vue templates)
 * - className={`template-${expression}`} (extracts the static parts)
 * - className={['array', 'of', 'classes']}
 * - :class="..." (Vue dynamic bindings)
 */
export function scanCandidates(code: string): Set<string> {
	const candidates = new Set<string>()

	// 1. Match className="string" or class="string" (React and Vue)
	const stringMatches = code.matchAll(
		/(?:className|class)\s*=\s*(["'])([^"']+)\1/g
	)
	for (const match of stringMatches) {
		const classList = match[2]!.split(/\s+/)

		for (const cls of classList) {
			if (cls) {
				candidates.add(cls)
				// If it looks like a compound selector in a string, add parts too
				if (cls.includes('.')) {
					cls.split('.').forEach((p) => p && candidates.add(p))
				}
			}
		}
	}

	// 2. Match className={...} or :class="{...}" (React JSX and Vue bindings)
	const curlyMatches = code.matchAll(
		/(?:className|:class)\s*=\s*["']?\{([^}]+)\}/g
	)
	for (const match of curlyMatches) {
		const content = match[1]!

		// Extract all string literals from the expression
		const literalMatches = content.matchAll(/['"]([^'"]+)['"]/g)
		for (const lit of literalMatches) {
			const classList = lit[1]!.split(/\s+/)
			for (const cls of classList) {
				if (cls) candidates.add(cls)
			}
		}

		// Handle template literals (rough approach: extract static parts)
		const templateMatches = content.matchAll(/`([^`]+)`/g)
		for (const tmpl of templateMatches) {
			// Remove ${...} parts and split by space
			const staticParts = tmpl[1]!.replace(/\$\{[^}]+\}/g, ' ').split(/\s+/)
			for (const part of staticParts) {
				if (part) candidates.add(part)
			}
		}
	}

	// 3. Match Vue :class="expression" with array syntax
	const vueClassMatches = code.matchAll(/:class\s*=\s*"([^"]+)"/g)
	for (const match of vueClassMatches) {
		const content = match[1]!

		// Extract string literals from arrays like ['class1', 'class2']
		const arrayLiterals = content.matchAll(/['"]([^'"]+)['"]/g)
		for (const lit of arrayLiterals) {
			const classList = lit[1]!.split(/\s+/)
			for (const cls of classList) {
				if (cls) candidates.add(cls)
			}
		}
	}

	return candidates
}
