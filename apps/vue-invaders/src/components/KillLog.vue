<script setup lang="ts">
import { computed } from 'vue'
import { Box, Text } from '@wolfie/vue'
import type { Kill } from '../composables/useInvaders'
import { BRAND } from '../theme'

//#region Props
const props = defineProps<{
	kills: readonly Kill[]
}>()
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

//#region Computed
const visibleKills = computed(() => props.kills.slice(-MAX_VISIBLE_KILLS))
const emptySlots = computed(() => MAX_VISIBLE_KILLS - visibleKills.value.length)
//#endregion Computed

//#region Helpers
function getAlienConfig(type: number) {
	return (
		ALIEN_CONFIG[type] ?? { name: 'Unknown', color: 'text-white', points: 0 }
	)
}
//#endregion Helpers
</script>

<template>
	<Box :style="{ flexDirection: 'column', minWidth: 20 }">
		<Text :style="{ color: BRAND.primary }" class="font-bold"
			>⚔ Recent Kills</Text
		>
		<template v-if="visibleKills.length === 0">
			<Text :style="{ color: BRAND.textMuted }" class="italic">
				Start shooting!</Text
			>
		</template>
		<template v-else>
			<Text
				v-for="kill in visibleKills"
				:key="kill.id"
				:class="getAlienConfig(kill.alien.type).color"
			>
				{{ getAlienConfig(kill.alien.type).name }} +{{ kill.points }}</Text
			>
		</template>
		<!-- Fill remaining slots with empty lines to maintain height -->
		<template v-if="emptySlots > 0 && visibleKills.length > 0">
			<Text v-for="i in emptySlots" :key="`empty-${i}`"> </Text>
		</template>
	</Box>
</template>
