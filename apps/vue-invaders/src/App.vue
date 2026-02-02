<script setup lang="ts">
import { ref } from 'vue'
import { Box, provideTheme, ErrorOverview, useStderr } from '@wolfie/vue'
import { invadersTheme } from './theme'
import { useInvaders } from './composables/useInvaders'
import { useTerminalSize } from './composables/useTerminalSize'

// Load screens
import Menu from './screens/Menu.vue'
import Game from './screens/Game.vue'
import GameOver from './screens/GameOver.vue'
import HighScores from './screens/HighScores.vue'
import Settings from './screens/Settings.vue'
import Help from './screens/Help.vue'

//#region Theme Provider
provideTheme(invadersTheme)
//#endregion Theme Provider

//#region Error Handling
const error = ref<Error | null>(null)
const { write: writeStderr } = useStderr()

function handleError(err: Error) {
	error.value = err
	writeStderr(`Error: ${err.message}\n${err.stack ?? ''}\n`)
}
//#endregion Error Handling

//#region Game State
const { width: termWidth, height: termHeight } = useTerminalSize()
const {
	state,
	navigate,
	startGame,
	tick,
	movePlayer,
	shoot,
	alienShoot,
	pause,
	nextWave,
	updateSettings,
	restart,
} = useInvaders(termWidth, termHeight)
//#endregion Game State
</script>

<template>
	<ErrorOverview v-if="error" :error="error" /><Menu
		v-else-if="state.screen === 'menu'"
		:on-navigate="navigate"
		:on-start-game="startGame"
	/><Game
		v-else-if="state.screen === 'game'"
		:state="state"
		:on-tick="tick"
		:on-move-player="movePlayer"
		:on-shoot="shoot"
		:on-alien-shoot="alienShoot"
		:on-pause="pause"
		:on-next-wave="nextWave"
		:on-navigate="navigate"
	/><GameOver
		v-else-if="state.screen === 'gameover'"
		:score="state.score"
		:wave="state.wave"
		:on-navigate="navigate"
		:on-restart="restart"
	/><HighScores
		v-else-if="state.screen === 'highscores'"
		:score="state.score"
		:on-navigate="navigate"
	/><Settings
		v-else-if="state.screen === 'settings'"
		:settings="state.settings"
		:on-update-settings="updateSettings"
		:on-navigate="navigate"
	/><Help v-else-if="state.screen === 'help'" :on-navigate="navigate" />
</template>
