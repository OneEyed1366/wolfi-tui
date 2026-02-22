import { type JSX, Show, splitProps } from 'solid-js'
import { Box } from './Box'
import { Text } from './Text'

//#region Types
export type IAlertVariant = 'info' | 'success' | 'error' | 'warning'

export interface IAlertProps {
	children: JSX.Element
	variant: IAlertVariant
	title?: string
}
//#endregion Types

//#region Constants
const ICONS: Record<IAlertVariant, string> = {
	info: 'ℹ',
	success: '✔',
	error: '✖',
	warning: '⚠',
}

const COLORS: Record<IAlertVariant, string> = {
	info: 'blue',
	success: 'green',
	error: 'red',
	warning: 'yellow',
}
//#endregion Constants

export function Alert(props: IAlertProps): JSX.Element {
	const [local] = splitProps(props, ['children', 'variant', 'title'])
	const color = () => COLORS[local.variant]

	return (
		<Box
			style={{
				// WHY: 'round' is the primary border test — exercises all 8 border glyphs
				borderStyle: 'round',
				borderColor: color(),
				flexGrow: 1,
			}}
		>
			{/* Icon column — fixed width, does not shrink */}
			<Box style={{ flexShrink: 0, marginRight: 1 }}>
				<Text style={{ color: color() }}>{ICONS[local.variant]}</Text>
			</Box>
			{/* Content column — title (optional) above message */}
			<Box style={{ flexDirection: 'column', flexGrow: 1 }}>
				<Show when={local.title}>
					<Text style={{ bold: true }}>{local.title}</Text>
				</Show>
				<Text>{local.children}</Text>
			</Box>
		</Box>
	)
}
