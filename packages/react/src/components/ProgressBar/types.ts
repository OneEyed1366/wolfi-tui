import type { IComponentTheme } from '../../theme/theme'
import type { IProps as BoxProps } from '../Box'
import type { IProps as TextProps } from '../Text'

//#region Types
export type IProgressBarProps = {
	/**
	 * Progress.
	 * Must be between 0 and 100.
	 *
	 * @default 0
	 */
	value: number
}

type IProgressBarTheme = {
	styles: {
		container: () => Partial<BoxProps>
		completed: () => Partial<TextProps>
		remaining: () => Partial<TextProps>
	}
	config: () => {
		completedCharacter: string
		remainingCharacter: string
	}
}
//#endregion Types
