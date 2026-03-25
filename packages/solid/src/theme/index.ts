import { useContext } from 'solid-js'
import { type ITheme, type IComponentTheme } from '@wolf-tui/shared'
import { ThemeCtx } from '../context/symbols'

export type {
	ITheme,
	IComponentTheme,
	IComponentStyles,
} from '@wolf-tui/shared'
export { extendTheme } from '@wolf-tui/shared'

export const defaultTheme: ITheme = {
	components: {},
}

export const useComponentTheme = <Theme extends IComponentTheme>(
	component: string
): Theme | undefined => {
	const theme = useContext(ThemeCtx) ?? defaultTheme
	return theme.components[component] as Theme | undefined
}
