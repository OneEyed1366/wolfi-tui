import { compile } from 'tailwindcss'
import path from 'node:path'

const css = `
@import "tailwindcss/theme";
@import "tailwindcss/utilities";
`

console.log('Testing compile with loadStylesheet and base...')

try {
	await compile(css, {
		base: process.cwd(),
		loadStylesheet: async (id, base) => {
			console.log('loadStylesheet called for:', id)
			return { content: '', base: '/' }
		},
	})
	console.log('Success!')
} catch (e) {
	console.error('Error:', e)
}
