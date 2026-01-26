import { inject, provide, type InjectionKey } from 'vue'
import { merge } from 'es-toolkit/compat'
import { ThemeSymbol } from '../context/symbols'

//#region Types
export type ITheme = {
	components: Record<string, IComponentTheme>
}

export type IComponentTheme = {
	styles?: Record<string, (props?: any) => IComponentStyles>
	config?: (props?: any) => Record<string, unknown>
}

export type IComponentStyles = Record<string, unknown>
//#endregion Types

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

export const extendTheme = (
	originalTheme: ITheme,
	newTheme: ITheme
): ITheme => {
	return merge(originalTheme, newTheme) as ITheme
}

export const useComponentTheme = <Theme extends IComponentTheme>(
	component: string
): Theme | undefined => {
	const theme = inject(ThemeKey, defaultTheme)
	return theme.components[component] as Theme | undefined
}
