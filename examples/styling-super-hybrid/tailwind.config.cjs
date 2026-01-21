const path = require('path')

module.exports = {
	content: [
		path.join(__dirname, './index.tsx'),
		path.join(__dirname, './styles/**/*.{css,scss}'),
	],
	theme: {
		extend: {
			colors: {
				primary: 'magenta',
				secondary: 'cyan',
				accent: 'yellow',
			},
			spacing: {
				18: '4.5rem',
			},
		},
	},
	plugins: [],
}
