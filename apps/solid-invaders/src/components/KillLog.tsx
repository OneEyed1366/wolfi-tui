import { createMemo, Show, For } from 'solid-js'
import { Box, Text } from '@wolfie/solid'
import type { Kill } from '../composables/useInvaders'
import { BRAND } from '../theme'

//#region Props
type KillLogProps = {
	kills: readonly Kill[]
}
//#endregion Props

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

//#region Helpers
function getAlienConfig(type: number) {
	return (
		ALIEN_CONFIG[type] ?? { name: 'Unknown', color: 'text-white', points: 0 }
	)
}
//#endregion Helpers

//#region Component
export default function KillLog(props: KillLogProps) {
	const visibleKills = createMemo(() => props.kills.slice(-MAX_VISIBLE_KILLS))
	const emptySlots = createMemo(() => MAX_VISIBLE_KILLS - visibleKills().length)

	return (
		<Box style={{ flexDirection: 'column', minWidth: 20 }}>
			<Text style={{ color: BRAND.primary }} className="font-bold">
				⚔ Recent Kills
			</Text>
			<Show
				when={visibleKills().length > 0}
				fallback={
					<Text style={{ color: BRAND.textMuted }} className="italic">
						Start shooting!
					</Text>
				}
			>
				<For each={visibleKills()}>
					{(kill) => (
						<Text className={getAlienConfig(kill.alien.type).color}>
							{getAlienConfig(kill.alien.type).name} +{kill.points}
						</Text>
					)}
				</For>
				<Show when={emptySlots() > 0}>
					<For each={Array.from({ length: emptySlots() })}>
						{() => <Text> </Text>}
					</For>
				</Show>
			</Show>
		</Box>
	)
}
//#endregion Component
