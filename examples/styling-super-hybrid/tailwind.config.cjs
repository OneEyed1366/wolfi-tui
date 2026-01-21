module.exports = {
	content: [
		'./index.tsx',
		'./styles/global.css',
		'./styles/components.scss',
		'./styles/tailwind.css',
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
