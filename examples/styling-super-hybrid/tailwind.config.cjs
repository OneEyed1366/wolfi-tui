module.exports = {
	content: [require.resolve('./index.tsx')],
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
