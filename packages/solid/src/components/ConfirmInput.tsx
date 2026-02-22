import { type JSX, createMemo, splitProps } from 'solid-js'
import { Text, type TextProps } from './Text'
import { useInput } from '../composables/use-input'
import { useComponentTheme, type IComponentTheme } from '../theme'

//#region Types
export interface IConfirmInputProps {
	isDisabled?: boolean
	defaultChoice?: 'confirm' | 'cancel'
	submitOnEnter?: boolean
	onConfirm: () => void
	onCancel: () => void
}

export type ConfirmInputTheme = IComponentTheme & {
	styles: {
		input: (props: { isFocused: boolean }) => Partial<TextProps>
	}
}
//#endregion Types

//#region Theme
export const confirmInputTheme: ConfirmInputTheme = {
	styles: {
		input: ({ isFocused }: { isFocused: boolean }): Partial<TextProps> => ({
			style: {
				color: isFocused ? undefined : 'gray',
			},
		}),
	},
}
//#endregion Theme

//#region Component
export function ConfirmInput(props: IConfirmInputProps): JSX.Element {
	const [local] = splitProps(props, [
		'isDisabled',
		'defaultChoice',
		'submitOnEnter',
		'onConfirm',
		'onCancel',
	])

	const isActive = createMemo(() => !local.isDisabled)

	useInput(
		(input, key) => {
			if (input.toLowerCase() === 'y') {
				local.onConfirm()
			}
			if (input.toLowerCase() === 'n') {
				local.onCancel()
			}
			if (key.return && (local.submitOnEnter ?? true)) {
				if ((local.defaultChoice ?? 'confirm') === 'confirm') {
					local.onConfirm()
				} else {
					local.onCancel()
				}
			}
		},
		{ isActive },
	)

	const theme = useComponentTheme<ConfirmInputTheme>('ConfirmInput')
	const { styles } = theme ?? confirmInputTheme

	return (
		<Text {...styles.input({ isFocused: !local.isDisabled })}>
			{(local.defaultChoice ?? 'confirm') === 'confirm' ? 'Y/n' : 'y/N'}
		</Text>
	)
}
//#endregion Component
