import { Box, Text } from '@wolfie/react'
import type { Kill } from '../hooks/useInvaders'
import { BRAND } from '../theme'

//#region Types
type KillLogProps = {
	kills: Kill[]
}
//#endregion Types

//#region Alien Display Config
const ALIEN_CONFIG = [
	{ name: 'Top', color: 'text-red', points: 30 },
	{ name: 'Mid', color: 'text-yellow', points: 20 },
	{ name: 'Bot', color: 'text-green', points: 10 },
] as const
//#endregion Alien Display Config

//#region Constants
const MAX_VISIBLE_KILLS = 3
//#endregion Constants

//#region Component
export function KillLog({ kills }: KillLogProps) {
	const visibleKills = kills.slice(-MAX_VISIBLE_KILLS)
	const emptySlots = MAX_VISIBLE_KILLS - visibleKills.length

	return (
		<Box style={{ flexDirection: 'column', minWidth: 20 }}>
			<Text style={{ color: BRAND.primary }} className="font-bold">
				⚔ Recent Kills
			</Text>
			{visibleKills.length === 0 ? (
				<Text style={{ color: BRAND.textMuted }} className="italic">
					{' '}
					Start shooting!
				</Text>
			) : (
				visibleKills.map((kill) => {
					const config = ALIEN_CONFIG[kill.alien.type]
					return (
						<Text key={kill.id} className={config?.color ?? 'text-white'}>
							{config?.name ?? 'Unknown'} +{kill.points}
						</Text>
					)
				})
			)}
			{/* Fill remaining slots with empty lines to maintain height */}
			{emptySlots > 0 &&
				visibleKills.length > 0 &&
				Array.from({ length: emptySlots }, (_, i) => (
					<Text key={`empty-${i}`}> </Text>
				))}
		</Box>
	)
}
//#endregion Component
