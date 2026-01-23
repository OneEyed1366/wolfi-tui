/**
 * Simple regex-based scanner to find candidate class names in source code.
 * Matches:
 * - className="static-class"
 * - className={`template-${expression}`} (extracts the static parts)
 * - className={['array', 'of', 'classes']}
 */
export function scanCandidates(code: string): Set<string> {
	const candidates = new Set<string>()

	// 1. Match className="string" or className='string'
	const stringMatches = code.matchAll(/className\s*=\s*(["'])([^"']+)\1/g)
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

	// 2. Match className={...}
	const curlyMatches = code.matchAll(/className\s*=\s*\{([^}]+)\}/g)
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

	return candidates
}
