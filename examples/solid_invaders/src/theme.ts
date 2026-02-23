import { extendTheme, defaultTheme, type ITheme } from '@wolfie/solid'

//#region Brand Colors - Solid
export const BRAND = {
	name: 'Solid',
	primary: '#2c4f7c', // Solid blue
	primaryDark: '#446b9e', // Solid lighter blue
	bgDark: '#1a1a2e',
	bgDarker: '#16162a',
	bgAccent: '#242442',
	text: '#ffffff',
	textMuted: '#8b949e',
	success: '#42b883',
	error: '#f85149',
	warning: '#d29922',
} as const
//#endregion Brand Colors

//#region Theme Extension
export const invadersTheme: ITheme = extendTheme(defaultTheme, {
	components: {},
})
//#endregion Theme Extension
