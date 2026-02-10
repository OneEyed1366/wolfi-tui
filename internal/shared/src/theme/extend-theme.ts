import { merge } from 'es-toolkit/compat'
import type { ITheme } from './types'

export const extendTheme = (
	originalTheme: ITheme,
	newTheme: Partial<ITheme>
): ITheme => {
	return merge(originalTheme, newTheme) as ITheme
}
