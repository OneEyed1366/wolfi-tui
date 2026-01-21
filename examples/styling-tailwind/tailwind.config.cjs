/** @type {import('tailwindcss').Config} */
const path = require('node:path')

module.exports = {
	content: [path.resolve(__dirname, './index.tsx')],
	theme: {
		extend: {},
	},
	plugins: [],
}
