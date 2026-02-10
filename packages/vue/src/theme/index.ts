import { inject, provide, type InjectionKey } from 'vue'
import { type ITheme, type IComponentTheme } from '@wolfie/shared'
import { ThemeSymbol } from '../context/symbols'

export type { ITheme, IComponentTheme, IComponentStyles } from '@wolfie/shared'
export { extendTheme } from '@wolfie/shared'

//#region Default Theme
// Empty default theme - components provide their own fallbacks
export const defaultTheme: ITheme = {
	components: {},
}
//#endregion Default Theme

export const ThemeKey = ThemeSymbol as InjectionKey<ITheme>

export function provideTheme(theme: ITheme): void {
	provide(ThemeKey, theme)
}

export const useComponentTheme = <Theme extends IComponentTheme>(
	component: string
): Theme | undefined => {
	const theme = inject(ThemeKey, defaultTheme)
	return theme.components[component] as Theme | undefined
}
