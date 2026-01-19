import {type ReactNode, createContext, useContext} from 'react';
import deepmerge from 'deepmerge';
import {badgeTheme} from '../components/ui/Badge.js';
import {spinnerTheme} from '../components/ui/Spinner.js';
import {progressBarTheme} from '../components/ui/ProgressBar.js';
import {statusMessageTheme} from '../components/ui/StatusMessage.js';
import {alertTheme} from '../components/ui/Alert.js';

export type Theme = {
	components: Record<string, ComponentTheme>;
};

export type ComponentTheme = {
	styles?: Record<string, (props?: any) => ComponentStyles>;
	config?: (props?: any) => Record<string, unknown>;
};

export type ComponentStyles = Record<string, unknown>;

export const defaultTheme: Theme = {
	components: {
		Badge: badgeTheme,
		Spinner: spinnerTheme,
		ProgressBar: progressBarTheme,
		StatusMessage: statusMessageTheme,
		Alert: alertTheme,
	},
};

export const ThemeContext = createContext<Theme>(defaultTheme);

export type ThemeProviderProps = {
	readonly children: ReactNode;
	readonly theme: Theme;
};

export function ThemeProvider({children, theme}: ThemeProviderProps) {
	return (
		<ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>
	);
}

export const extendTheme = (originalTheme: Theme, newTheme: Theme) => {
	return deepmerge(originalTheme, newTheme);
};

export const useComponentTheme = <Theme extends ComponentTheme>(
	component: string,
): Theme => {
	const theme = useContext(ThemeContext);
	return theme.components[component] as Theme;
};
