import { Box, Text } from '@wolfie/react'
import { PLAYER_SPRITE, BOARD_HEIGHT, BOARD_PADDING } from '../constants'

//#region Types
type PlayerProps = {
	x: number
}
//#endregion Types

//#region Component
export function Player({ x }: PlayerProps) {
	return (
		<Box
			style={{
				position: 'absolute',
				left: x,
				top: BOARD_HEIGHT - BOARD_PADDING - 2,
			}}
		>
			<Text className="text-player font-bold">{PLAYER_SPRITE}</Text>
		</Box>
	)
}
//#endregion Component
