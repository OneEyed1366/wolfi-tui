import { InjectionToken } from '@angular/core'
import type { ITheme, IComponentTheme } from '@wolf-tui/shared'

export type {
	ITheme,
	IComponentTheme,
	IComponentStyles,
} from '@wolf-tui/shared'
export { extendTheme } from '@wolf-tui/shared'

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
