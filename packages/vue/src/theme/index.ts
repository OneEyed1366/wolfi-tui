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

//#region Theme Imports
import { alertTheme } from '../components/Alert'
import { badgeTheme } from '../components/Badge'
import { spinnerTheme } from '../components/Spinner'
import { statusMessageTheme } from '../components/StatusMessage'
import { progressBarTheme } from '../components/ProgressBar'
import { orderedListTheme } from '../components/OrderedList'
import { unorderedListTheme } from '../components/UnorderedList'
import { textInputTheme } from '../components/TextInput'
import { passwordInputTheme } from '../components/PasswordInput'
import { emailInputTheme } from '../components/EmailInput'
import { confirmInputTheme } from '../components/ConfirmInput'
import { selectTheme } from '../components/SelectOption'
import { multiSelectTheme } from '../components/MultiSelectOption'
//#endregion Theme Imports

//#region Default Theme
export const defaultTheme: ITheme = {
	components: {
		Alert: alertTheme,
		Badge: badgeTheme,
		Spinner: spinnerTheme,
		StatusMessage: statusMessageTheme,
		ProgressBar: progressBarTheme,
		OrderedList: orderedListTheme,
		UnorderedList: unorderedListTheme,
		TextInput: textInputTheme,
		PasswordInput: passwordInputTheme,
		EmailInput: emailInputTheme,
		ConfirmInput: confirmInputTheme,
		Select: selectTheme,
		MultiSelect: multiSelectTheme,
	},
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
): Theme => {
	const theme = inject(ThemeKey, defaultTheme)
	return theme.components[component] as Theme
}
