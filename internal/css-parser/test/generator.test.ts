import { describe, it, expect } from 'vitest'
import {
	generateTypeScript,
	generateJavaScript,
	sanitizeIdentifier,
} from '../src/generator'
import type { ParsedStyles } from '../src/types'

describe('Code Generator - sanitizeIdentifier', () => {
	it('removes leading dot', () => {
		expect(sanitizeIdentifier('.container')).toBe('container')
	})

	it('converts kebab-case to camelCase', () => {
		expect(sanitizeIdentifier('my-class')).toBe('myClass')
	})

	it('handles multiple hyphens', () => {
		expect(sanitizeIdentifier('my-long-class-name')).toBe('myLongClassName')
	})

	it('handles already camelCase', () => {
		expect(sanitizeIdentifier('myClass')).toBe('myClass')
	})

	it('prefixes leading digits with underscore', () => {
		expect(sanitizeIdentifier('123-class')).toBe('_123Class')
	})

	it('replaces invalid characters with underscores', () => {
		expect(sanitizeIdentifier('class@name')).toBe('class_name')
	})
})

describe('Code Generator - TypeScript Module Mode', () => {
	const styles: ParsedStyles = {
		container: { display: 'flex', gap: 4 },
		header: { padding: 2 },
	}

	it('generates default export with styles object', () => {
		const output = generateTypeScript(styles, { mode: 'module' })
		expect(output).toContain('export default styles')
		expect(output).toContain('const styles = {')
	})

	it('includes type import', () => {
		const output = generateTypeScript(styles, { mode: 'module' })
		expect(output).toContain("import type { Styles } from '@wolfie/core'")
	})

	it('includes style properties', () => {
		const output = generateTypeScript(styles, { mode: 'module' })
		expect(output).toContain('container')
		expect(output).toContain('display')
		expect(output).toContain('flex')
	})

	it('uses as Styles type assertion', () => {
		const output = generateTypeScript(styles, { mode: 'module' })
		expect(output).toContain('as Styles')
	})

	it('preserves numeric values', () => {
		const output = generateTypeScript(styles, { mode: 'module' })
		expect(output).toContain('gap: 4')
		expect(output).toContain('padding: 2')
	})
})

describe('Code Generator - TypeScript Global Mode', () => {
	const styles: ParsedStyles = {
		container: { display: 'flex' },
	}

	it('generates registerStyles call', () => {
		const output = generateTypeScript(styles, { mode: 'global' })
		expect(output).toContain('registerStyles({')
		expect(output).toContain(
			"import { registerStyles, registerTailwindMetadata } from '@wolfie/react/styles'"
		)
	})

	it('does not include default export', () => {
		const output = generateTypeScript(styles, { mode: 'global' })
		expect(output).not.toContain('export default')
	})

	it('does not include type import in global mode', () => {
		const output = generateTypeScript(styles, { mode: 'global' })
		expect(output).not.toContain('import type { Styles }')
	})
})

describe('Code Generator - JavaScript Output', () => {
	const styles: ParsedStyles = {
		container: { display: 'flex' },
	}

	it('does not include type imports', () => {
		const output = generateJavaScript(styles, { mode: 'module' })
		expect(output).not.toContain('import type')
	})

	it('does not include as Styles assertion', () => {
		const output = generateJavaScript(styles, { mode: 'module' })
		expect(output).not.toContain('as Styles')
	})

	it('generates valid JavaScript module', () => {
		const output = generateJavaScript(styles, { mode: 'module' })
		expect(output).toContain('const styles = {')
		expect(output).toContain('export default styles')
	})

	it('generates JavaScript global mode', () => {
		const output = generateJavaScript(styles, { mode: 'global' })
		expect(output).toContain(
			"import { registerStyles, registerTailwindMetadata } from '@wolfie/react/styles'"
		)
		expect(output).toContain('registerStyles({')
	})
})

describe('Code Generator - Minified Output', () => {
	const styles: ParsedStyles = {
		container: { display: 'flex', gap: 4 },
	}

	it('produces compact output', () => {
		const output = generateTypeScript(styles, { mode: 'module', minify: true })
		// Minified should have fewer newlines
		const lines = output.trim().split('\n')
		expect(lines.length).toBeLessThanOrEqual(2)
	})

	it('removes extra whitespace', () => {
		const output = generateTypeScript(styles, { mode: 'module', minify: true })
		expect(output).not.toContain('\t')
	})

	it('uses compact object notation', () => {
		const output = generateTypeScript(styles, { mode: 'module', minify: true })
		// Should have compact format like {key:value} without spaces after colon
		expect(output).toMatch(/display:"flex"/)
	})

	it('minifies JavaScript output too', () => {
		const output = generateJavaScript(styles, { mode: 'module', minify: true })
		expect(output).not.toContain('\t')
		expect(output).toMatch(/display:"flex"/)
	})
})

describe('Code Generator - Edge Cases', () => {
	it('handles empty styles', () => {
		const styles: ParsedStyles = {}
		const output = generateTypeScript(styles, { mode: 'module' })
		expect(output).toContain('const styles = {}')
		expect(output).toContain('export default styles')
	})

	it('handles styles with empty properties', () => {
		const styles: ParsedStyles = {
			empty: {},
		}
		const output = generateTypeScript(styles, { mode: 'module' })
		expect(output).toContain('empty: {}')
	})

	it('handles string values with special characters', () => {
		const styles: ParsedStyles = {
			test: { borderColor: '"quoted"' },
		}
		const output = generateTypeScript(styles, { mode: 'module' })
		// JSON.stringify should escape quotes
		expect(output).toContain('borderColor:')
	})

	it('handles boolean values', () => {
		const styles: ParsedStyles = {
			test: { overflowWrap: 'break-word' } as ParsedStyles['string'],
		}
		const output = generateTypeScript(styles, { mode: 'module' })
		expect(output).toContain('overflowWrap')
	})

	it('defaults to module mode when mode not specified', () => {
		const styles: ParsedStyles = {
			test: { display: 'flex' },
		}
		const output = generateTypeScript(styles)
		expect(output).toContain('export default styles')
	})

	it('includes registerTailwindMetadata when metadata is provided', () => {
		const styles: ParsedStyles = {
			test: { display: 'flex' },
		}
		const output = generateTypeScript(styles, {
			mode: 'global',
			metadata: { prefixes: ['custom'], statics: ['my-static'] },
		})
		expect(output).toContain(
			'registerTailwindMetadata({"prefixes":["custom"],"statics":["my-static"]})'
		)
	})
})
