import {
	extendTheme,
	defaultTheme,
	type ITheme,
	type IComponentTheme,
} from '@wolfie/react'

//#region Brand Colors - React
// Swap this block for other packages (Vue: #42b883, Angular: #dd0031, Svelte: #ff3e00)
export const BRAND = {
	name: 'React',
	primary: '#61DAFB', // React cyan
	primaryDark: '#21a1c4', // Darker variant
	bgDark: '#20232a', // React dark bg
	bgDarker: '#181a1f', // Deeper dark
	bgAccent: '#282c34', // Secondary dark
	text: '#ffffff',
	textMuted: '#8b949e',
	success: '#3fb950',
	error: '#f85149',
	warning: '#d29922',
} as const
//#endregion Brand Colors

//#region Custom Badge Theme
const invadersBadgeTheme: IComponentTheme = {
	styles: {
		container: () => ({
			style: {
				paddingLeft: 1,
				paddingRight: 1,
			},
		}),
		label: () => ({
			style: {
				color: BRAND.textMuted,
			},
		}),
		value: ({ variant }: { variant?: string }) => {
			const colors: Record<string, string> = {
				score: BRAND.primary,
				lives: BRAND.error,
				wave: BRAND.primary,
				default: BRAND.text,
			}
			return {
				style: {
					color: colors[variant ?? 'default'] ?? BRAND.text,
					fontWeight: 'bold',
				},
			}
		},
	},
}
//#endregion Custom Badge Theme

//#region Custom Alert Theme
const invadersAlertTheme: IComponentTheme = {
	styles: {
		container: ({ variant }: { variant?: string }) => {
			const borderColors: Record<string, string> = {
				success: BRAND.success,
				error: BRAND.error,
				warning: BRAND.warning,
				info: BRAND.primary,
			}
			return {
				style: {
					borderStyle: 'double',
					borderColor: borderColors[variant ?? 'info'] ?? BRAND.text,
					padding: 1,
				},
			}
		},
		iconContainer: () => ({
			style: {
				marginRight: 1,
			},
		}),
		icon: ({ variant }: { variant?: string }) => {
			const colors: Record<string, string> = {
				success: BRAND.success,
				error: BRAND.error,
				warning: BRAND.warning,
				info: BRAND.primary,
			}
			return {
				style: {
					color: colors[variant ?? 'info'] ?? BRAND.text,
				},
			}
		},
		content: () => ({
			style: {
				flexDirection: 'column',
			},
		}),
		title: () => ({
			style: {
				fontWeight: 'bold',
			},
		}),
		message: () => ({}),
	},
	config: ({ variant }: { variant?: string }) => {
		const icons: Record<string, string> = {
			success: '✓',
			error: '✗',
			warning: '⚠',
			info: 'ⓘ',
		}
		return {
			icon: icons[variant ?? 'info'] ?? 'ⓘ',
		}
	},
}
//#endregion Custom Alert Theme

//#region Custom ProgressBar Theme
const invadersProgressBarTheme: IComponentTheme = {
	styles: {
		container: () => ({
			style: {
				flexGrow: 1,
				minWidth: 0,
			},
		}),
		completed: () => ({
			style: {
				color: BRAND.primary,
			},
		}),
		remaining: () => ({
			style: {
				color: BRAND.bgAccent,
			},
		}),
	},
	config: () => ({
		completedCharacter: '█',
		remainingCharacter: '░',
	}),
}
//#endregion Custom ProgressBar Theme

//#region Theme Extension
export const invadersTheme: ITheme = extendTheme(defaultTheme, {
	components: {
		Badge: invadersBadgeTheme,
		Alert: invadersAlertTheme,
		ProgressBar: invadersProgressBarTheme,
	},
})
//#endregion Theme Extension
