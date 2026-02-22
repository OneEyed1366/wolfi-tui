import { type JSX, splitProps } from 'solid-js'
import type { Styles } from '@wolfie/core'
import { Box } from './Box'
import { Text } from './Text'

//#region Types
export interface IBadgeProps {
	children: JSX.Element
	color?: string
	style?: Styles
}
//#endregion Types

export function Badge(props: IBadgeProps): JSX.Element {
	const [local] = splitProps(props, ['children', 'color', 'style'])

	return (
		<Box style={{ backgroundColor: local.color ?? 'magenta', ...local.style }}>
			{/* WHY: space padding mirrors React Badge for consistent terminal appearance */}
			<Text style={{ color: '#ffffff' }}> {local.children} </Text>
		</Box>
	)
}
