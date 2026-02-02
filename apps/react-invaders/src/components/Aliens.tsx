import { Box, Text, Transform } from '@wolfie/react'
import { ALIEN_SPRITE_FRAMES } from '../constants'
import type { Alien } from '../hooks/useInvaders'

//#region Types
type AliensProps = {
	aliens: Alien[]
	frame: number
}
//#endregion Types

//#region Alien Colors by Type
const ALIEN_COLORS = [
	'text-alien-top',
	'text-alien-mid',
	'text-alien-bot',
] as const
//#endregion Alien Colors by Type

//#region Single Alien Component
function AlienSprite({ alien, frame }: { alien: Alien; frame: number }) {
	if (!alien.alive) return null

	const spriteFrame = frame % 3
	const baseSprite = ALIEN_SPRITE_FRAMES[alien.type]?.[0] ?? 'X'

	return (
		<Box
			style={{
				position: 'absolute',
				left: alien.x,
				top: alien.y,
			}}
		>
			<Transform
				transform={() => {
					const sprites = ALIEN_SPRITE_FRAMES[alien.type]
					if (!sprites) return baseSprite
					return sprites[spriteFrame] ?? baseSprite
				}}
			>
				<Text className={ALIEN_COLORS[alien.type]}>{baseSprite}</Text>
			</Transform>
		</Box>
	)
}
//#endregion Single Alien Component

//#region Component
export function Aliens({ aliens, frame }: AliensProps) {
	return (
		<>
			{aliens.map((alien) => (
				<AlienSprite key={alien.id} alien={alien} frame={frame} />
			))}
		</>
	)
}
//#endregion Component
