import { type JSX, splitProps } from 'solid-js'
import { Box } from './Box'
import { Text } from './Text'

//#region Types
export type IStatusMessageVariant = 'info' | 'success' | 'error' | 'warning'

export interface IStatusMessageProps {
	children: JSX.Element
	variant: IStatusMessageVariant
}
//#endregion Types

//#region Constants
const ICONS: Record<IStatusMessageVariant, string> = {
	info: 'ℹ',
	success: '✔',
	error: '✖',
	warning: '⚠',
}

const COLORS: Record<IStatusMessageVariant, string> = {
	info: 'blue',
	success: 'green',
	error: 'red',
	warning: 'yellow',
}
//#endregion Constants

export function StatusMessage(props: IStatusMessageProps): JSX.Element {
	const [local] = splitProps(props, ['children', 'variant'])

	return (
		// WHY: gap:1 = one terminal column between icon and message text
		<Box style={{ gap: 1 }}>
			<Box style={{ flexShrink: 0 }}>
				<Text style={{ color: COLORS[local.variant] }}>
					{ICONS[local.variant]}
				</Text>
			</Box>
			<Text>{local.children}</Text>
		</Box>
	)
}
