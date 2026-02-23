import { Box, Text } from '@wolfie/react'
import { BULLET_SPRITE_UP, BULLET_SPRITE_DOWN } from '../constants'
import type { Bullet } from '../hooks/useInvaders'

//#region Types
type BulletsProps = {
	bullets: Bullet[]
}
//#endregion Types

//#region Component
export function Bullets({ bullets }: BulletsProps) {
	return (
		<>
			{bullets.map((bullet) => (
				<Box
					key={bullet.id}
					style={{
						position: 'absolute',
						left: bullet.x,
						top: bullet.y,
					}}
				>
					<Text
						className={
							bullet.dy === -1 ? 'text-bullet-player' : 'text-bullet-alien'
						}
					>
						{bullet.dy === -1 ? BULLET_SPRITE_UP : BULLET_SPRITE_DOWN}
					</Text>
				</Box>
			))}
		</>
	)
}
//#endregion Component
