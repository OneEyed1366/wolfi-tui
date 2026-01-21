const path = require('path')

module.exports = {
	content: [
		path.join(process.cwd(), 'examples/styling-super-hybrid/**/*.{ts,tsx}'),
		path.join(process.cwd(), 'examples/styling-super-hybrid/index.tsx'),
	],
	theme: {
		extend: {
			colors: {
				primary: 'magenta',
				secondary: 'cyan',
				accent: 'yellow',
			},
		},
	},
	plugins: [],
}
