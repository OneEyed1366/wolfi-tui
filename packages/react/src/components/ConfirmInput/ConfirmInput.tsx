import { Text } from '../Text'
import { useInput } from '../../hooks/use-input'
import { useComponentTheme } from '../../theme/theme'
import type { IProps as TextProps } from '../Text'
import type { IComponentTheme } from '../../theme/theme'

//#region Theme
type IConfirmInputTheme = IComponentTheme & {
	styles: {
		input: (props: { isFocused: boolean }) => TextProps
	}
}

export const confirmInputTheme = {
	styles: {
		input: ({ isFocused }: { isFocused: boolean }): TextProps => ({
			style: {
				color: isFocused ? undefined : 'gray',
			},
		}),
	},
} satisfies IComponentTheme
//#endregion Theme

//#region Component
export type IConfirmInputProps = {
	/**
	 * When disabled, user input is ignored.
	 *
	 * @default false
	 */
	isDisabled?: boolean

	/**
	 * Default choice.
	 *
	 * @default "confirm"
	 */
	defaultChoice?: 'confirm' | 'cancel'

	/**
	 * Confirm or cancel when user presses enter, depending on the `defaultChoice` value.
	 * Can be useful to disable when an explicit confirmation is required, such as pressing "Y" key.
	 *
	 * @default true
	 */
	submitOnEnter?: boolean

	/**
	 * Callback to trigger on confirmation.
	 */
	onConfirm: () => void

	/**
	 * Callback to trigger on cancellation.
	 */
	onCancel: () => void
}

export function ConfirmInput({
	isDisabled = false,
	defaultChoice = 'confirm',
	submitOnEnter = true,
	onConfirm,
	onCancel,
}: IConfirmInputProps) {
	useInput(
		(input: string, key: { return?: boolean }) => {
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

	const { styles } = useComponentTheme<IConfirmInputTheme>('ConfirmInput')

	return (
		<Text {...styles.input({ isFocused: !isDisabled })}>
			{defaultChoice === 'confirm' ? 'Y/n' : 'y/N'}
		</Text>
	)
}
//#endregion Component
