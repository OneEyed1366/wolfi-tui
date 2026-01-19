import { type ReactNode, createContext, useContext } from 'react'
import * as deepmergeModule from 'deepmerge'
const deepmerge = deepmergeModule.default ?? deepmergeModule
import { badgeTheme } from '../components/ui/Badge'
import { spinnerTheme } from '../components/ui/Spinner'
import { progressBarTheme } from '../components/ui/ProgressBar'
import { statusMessageTheme } from '../components/ui/StatusMessage'
import { alertTheme } from '../components/ui/Alert'
import { orderedListTheme } from '../components/ui/OrderedList/index'
import { unorderedListTheme } from '../components/ui/UnorderedList/index'
import { confirmInputTheme } from '../components/ui/ConfirmInput'
import { textInputTheme } from '../components/ui/TextInput/index'
import { passwordInputTheme } from '../components/ui/PasswordInput/index'
import { emailInputTheme } from '../components/ui/EmailInput/index'
import { selectTheme } from '../components/ui/Select/index'
import { multiSelectTheme } from '../components/ui/MultiSelect/index'

export type Theme = {
	components: Record<string, ComponentTheme>
}

export type ComponentTheme = {
	styles?: Record<string, (props?: any) => ComponentStyles>
	config?: (props?: any) => Record<string, unknown>
}

export type ComponentStyles = Record<string, unknown>

export const defaultTheme: Theme = {
	components: {
		Badge: badgeTheme,
		Spinner: spinnerTheme,
		ProgressBar: progressBarTheme,
		StatusMessage: statusMessageTheme,
		Alert: alertTheme,
		OrderedList: orderedListTheme,
		UnorderedList: unorderedListTheme,
		ConfirmInput: confirmInputTheme,
		TextInput: textInputTheme,
		PasswordInput: passwordInputTheme,
		EmailInput: emailInputTheme,
		Select: selectTheme,
		MultiSelect: multiSelectTheme,
	},
}

export const ThemeContext = createContext<Theme>(defaultTheme)

export type ThemeProviderProps = {
	readonly children: ReactNode
	readonly theme: Theme
}

export function ThemeProvider({ children, theme }: ThemeProviderProps) {
	return <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>
}

export const extendTheme = (originalTheme: Theme, newTheme: Theme) => {
	return deepmerge(originalTheme, newTheme)
}

export const useComponentTheme = <Theme extends ComponentTheme>(
	component: string
): Theme => {
	const theme = useContext(ThemeContext)
	return theme.components[component] as Theme
}
