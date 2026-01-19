import Text from '../Text.js'
import useInput from '../../hooks/use-input.js'
import { useComponentTheme } from '../../theme/theme.js'
import type { Props as TextProps } from '../Text.js'
import type { ComponentTheme } from '../../theme/theme.js'

//#region Theme
type ConfirmInputTheme = ComponentTheme & {
	styles: {
		input: (props: { isFocused: boolean }) => TextProps
	}
}

export const confirmInputTheme = {
	styles: {
		input: ({ isFocused }: { isFocused: boolean }): TextProps => ({
			dimColor: !isFocused,
		}),
	},
} satisfies ComponentTheme
//#endregion Theme

//#region Component
export type ConfirmInputProps = {
	/**
	 * When disabled, user input is ignored.
	 *
	 * @default false
	 */
	readonly isDisabled?: boolean

	/**
	 * Default choice.
	 *
	 * @default "confirm"
	 */
	readonly defaultChoice?: 'confirm' | 'cancel'

	/**
	 * Confirm or cancel when user presses enter, depending on the `defaultChoice` value.
	 * Can be useful to disable when an explicit confirmation is required, such as pressing "Y" key.
	 *
	 * @default true
	 */
	readonly submitOnEnter?: boolean

	/**
	 * Callback to trigger on confirmation.
	 */
	readonly onConfirm: () => void

	/**
	 * Callback to trigger on cancellation.
	 */
	readonly onCancel: () => void
}

export function ConfirmInput({
	isDisabled = false,
	defaultChoice = 'confirm',
	submitOnEnter = true,
	onConfirm,
	onCancel,
}: ConfirmInputProps) {
	useInput(
		(input, key) => {
			if (input.toLowerCase() === 'y') {
				onConfirm()
			}

			if (input.toLowerCase() === 'n') {
				onCancel()
			}

			if (key.return && submitOnEnter) {
				if (defaultChoice === 'confirm') {
					onConfirm()
				} else {
					onCancel()
				}
			}
		},
		{ isActive: !isDisabled }
	)

	const { styles } = useComponentTheme<ConfirmInputTheme>('ConfirmInput')

	return (
		<Text {...styles.input({ isFocused: !isDisabled })}>
			{defaultChoice === 'confirm' ? 'Y/n' : 'y/N'}
		</Text>
	)
}
//#endregion Component
