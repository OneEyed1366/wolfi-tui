import { InjectionToken } from '@angular/core'
import type { ITheme, IComponentTheme } from '@wolfie/shared'

export type { ITheme, IComponentTheme, IComponentStyles } from '@wolfie/shared'
export { extendTheme } from '@wolfie/shared'

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
export function useComponentTheme<T extends IComponentTheme>(
	theme: ITheme,
	componentName: string
): T | undefined {
	return theme.components[componentName] as T | undefined
}
//#endregion Helper Functions
