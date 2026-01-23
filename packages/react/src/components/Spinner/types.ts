import type { IComponentTheme } from '../../theme/theme'
import type { IProps as BoxProps } from '../Box'
import type { IProps as TextProps } from '../Text'
import type { UseSpinnerProps } from '../use-spinner'

//#region Types
export type ISpinnerProps = UseSpinnerProps & {
	/**
	 * Label to show near the spinner.
	 */
	label?: string
}

type ISpinnerTheme = {
	styles: {
		container: () => Partial<BoxProps>
		frame: () => Partial<TextProps>
		label: () => Partial<TextProps>
	}
}
//#endregion Types
