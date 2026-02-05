import { InjectionToken } from '@angular/core'
import { merge } from 'es-toolkit'

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
export const defaultTheme: ITheme = {
	components: {},
}
//#endregion Default Theme

//#region Theme Token
export const THEME_CONTEXT = new InjectionToken<ITheme>('WolfieTheme', {
	providedIn: 'root',
	factory: () => defaultTheme,
})
//#endregion Theme Token

//#region Helper Functions
export function extendTheme(base: ITheme, extension: Partial<ITheme>): ITheme {
	return merge(base, extension) as ITheme
}

export function useComponentTheme<T extends IComponentTheme>(
	theme: ITheme,
	componentName: string
): T | undefined {
	return theme.components[componentName] as T | undefined
}
//#endregion Helper Functions
