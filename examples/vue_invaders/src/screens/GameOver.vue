<script setup lang="ts">
import { computed } from 'vue'
import { Box, Text, useInput } from '@wolfie/vue'
import type { Screen } from '../composables/useInvaders'
import { BRAND } from '../theme'

//#region Props
const props = defineProps<{
	score: number
	wave: number
	onNavigate: (screen: Screen) => void
	onRestart: () => void
}>()
//#endregion Props

//#region ASCII Art
const GAME_OVER_ASCII = `
  ____    _    __  __ _____    _____     _______ ____
 / ___|  / \\  |  \\/  | ____|  / _ \\ \\   / / ____|  _ \\
| |  _  / _ \\ | |\\/| |  _|   | | | \\ \\ / /|  _| | |_) |
| |_| |/ ___ \\| |  | | |___  | |_| |\\ V / | |___|  _ <
 \\____/_/   \\_\\_|  |_|_____|  \\___/  \\_/  |_____|_| \\_\\
`
//#endregion ASCII Art

//#region Computed
const formattedScore = computed(() => props.score.toString().padStart(6, '0'))
//#endregion Computed

//#region Input Handling
useInput((input, key) => {
	if (key.return || input === 'r') {
		props.onRestart()
	} else if (input === 'h') {
		props.onNavigate('highscores')
	} else if (key.escape || input === 'q') {
		props.onNavigate('menu')
	}
})
//#endregion Input Handling
</script>

<template>
	<Box
		:style="{
			width: '100vw',
			height: '100vh',
			flexDirection: 'column',
			alignItems: 'center',
			justifyContent: 'center',
			backgroundColor: BRAND.bgDark,
		}"
	>
		<Text :style="{ color: BRAND.error }" class="font-bold">{{
			GAME_OVER_ASCII
		}}</Text>

		<Box
			:style="{ marginTop: 2, flexDirection: 'column', alignItems: 'center' }"
		>
			<Text :style="{ color: BRAND.primary }" class="font-bold text-lg"
				>SCORE: {{ formattedScore }}</Text
			>
			<Text :style="{ color: BRAND.primaryDark }">Wave {{ wave }}</Text>
		</Box>

		<Box
			:style="{ marginTop: 3, flexDirection: 'column', alignItems: 'center' }"
		>
			<Text :style="{ color: BRAND.primary }" class="font-bold">[R] Retry</Text>
			<Text :style="{ color: BRAND.textMuted }"
				>[H] High Scores • [Q] Menu</Text
			>
		</Box>
	</Box>
</template>
