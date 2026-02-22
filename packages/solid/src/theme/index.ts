import { useContext } from 'solid-js'
import { type ITheme, type IComponentTheme } from '@wolfie/shared'
import { ThemeCtx } from '../context/symbols'

export type { ITheme, IComponentTheme, IComponentStyles } from '@wolfie/shared'
export { extendTheme } from '@wolfie/shared'

export const defaultTheme: ITheme = {
	components: {},
}

export const useComponentTheme = <Theme extends IComponentTheme>(
	component: string
): Theme | undefined => {
	const theme = useContext(ThemeCtx) ?? defaultTheme
	return theme.components[component] as Theme | undefined
}
