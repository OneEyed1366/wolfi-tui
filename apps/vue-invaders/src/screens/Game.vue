<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { Box, Text, Spinner, Alert, useInput, useStdin } from '@wolfie/vue'
import GameCanvas from '../components/GameCanvas.vue'
import HUD from '../components/HUD.vue'
import KillLog from '../components/KillLog.vue'
import Controls from '../components/Controls.vue'
import { useGameLoop } from '../composables/useGameLoop'
import type { State, Screen } from '../composables/useInvaders'
import { ALIEN_SHOOT_INTERVAL } from '../constants'
import { debugLog } from '../debug'
import { BRAND } from '../theme'

//#region Props
const props = defineProps<{
	state: State
	onTick: () => void
	onMovePlayer: (dx: number) => void
	onShoot: () => void
	onAlienShoot: () => void
	onPause: () => void
	onNextWave: () => void
	onNavigate: (screen: Screen) => void
}>()
//#endregion Props

//#region State
const { isRawModeSupported } = useStdin()
const fps = ref(0)
let lastFrameTime = Date.now()
let frameCount = 0
//#endregion State

//#region FPS Calculation
watch(
	() => props.state.frame,
	() => {
		frameCount++
		const now = Date.now()
		const elapsed = now - lastFrameTime

		if (elapsed >= 1000) {
			fps.value = Math.round((frameCount * 1000) / elapsed)
			frameCount = 0
			lastFrameTime = now
		}
	}
)
//#endregion FPS Calculation

//#region Game Loop
const isRunning = computed(
	() => !props.state.paused && !props.state.waveTransition
)
useGameLoop({
	onTick: () => props.onTick(),
	isRunning,
})
//#endregion Game Loop

//#region Alien Shooting
let alienShootInterval: ReturnType<typeof setInterval> | null = null

function startAlienShooting() {
	if (alienShootInterval) return
	alienShootInterval = setInterval(() => {
		props.onAlienShoot()
	}, ALIEN_SHOOT_INTERVAL)
}

function stopAlienShooting() {
	if (alienShootInterval) {
		clearInterval(alienShootInterval)
		alienShootInterval = null
	}
}

watch(
	[() => props.state.paused, () => props.state.waveTransition],
	([paused, waveTransition]) => {
		if (paused || waveTransition) {
			stopAlienShooting()
		} else {
			startAlienShooting()
		}
	},
	{ immediate: true }
)

onUnmounted(() => {
	stopAlienShooting()
})
//#endregion Alien Shooting

//#region Wave Transition
watch(
	() => props.state.waveTransition,
	(waveTransition) => {
		if (waveTransition) {
			const timer = setTimeout(() => {
				props.onNextWave()
			}, 2000)
			onUnmounted(() => clearTimeout(timer))
		}
	}
)
//#endregion Wave Transition

//#region Input Handling
useInput(
	(input, key) => {
		if (input === 'p') {
			props.onPause()
			return
		}

		if (input === 'q') {
			props.onNavigate('menu')
			return
		}

		if (props.state.paused) return

		if (key.leftArrow) {
			props.onMovePlayer(-1)
		} else if (key.rightArrow) {
			props.onMovePlayer(1)
		} else if (input === ' ') {
			debugLog('Input: SPACE pressed')
			props.onShoot()
		}
	},
	{ isActive: true }
)
//#endregion Input Handling

//#region Computed
const pauseMarginTop = computed(() => Math.floor(props.state.board.height / 2))
//#endregion Computed
</script>

<template>
	<!-- Wave transition screen -->
	<Box
		v-if="state.waveTransition"
		:style="{
			width: '100vw',
			height: '100vh',
			flexDirection: 'column',
			alignItems: 'center',
			justifyContent: 'center',
			backgroundColor: BRAND.bgAccent,
		}"
	>
		<Alert variant="success" title="Wave Complete!">
			Excellent work, Commander! Preparing next wave…
		</Alert>

		<Box :style="{ marginTop: 2 }">
			<Spinner type="dots" />
			<Text class="text-cyan ml-2">
				{{ ' ' }}Loading Wave {{ state.wave + 1 }}…
			</Text>
		</Box>

		<Box :style="{ marginTop: 2 }">
			<Text class="text-yellow font-bold">Score: {{ state.score }}</Text>
		</Box>
	</Box>

	<!-- Main game screen -->
	<Box
		v-else
		:style="{
			width: '100vw',
			height: '100vh',
			flexDirection: 'column',
			backgroundColor: BRAND.bgDark,
		}"
	>
		<!-- Header -->
		<Box
			:style="{
				flexShrink: 0,
				paddingLeft: 1,
				paddingRight: 1,
				backgroundColor: BRAND.bgDark,
			}"
		>
			<HUD
				:score="state.score"
				:lives="state.lives"
				:wave="state.wave"
				:show-fps="state.settings.showFps"
				:fps="fps"
			/>
		</Box>

		<!-- Main game area - full width -->
		<Box
			:style="{
				flexGrow: 1,
				flexDirection: 'column',
				minHeight: 0,
				overflow: 'hidden',
			}"
		>
			<GameCanvas
				:aliens="state.aliens"
				:bullets="state.bullets"
				:shields="state.shields"
				:player-x="state.player.x"
				:frame="state.frame"
				:board-width="state.board.width"
				:board-height="state.board.height"
			/>
		</Box>

		<!-- Pause indicator - overlay style -->
		<Box
			v-if="state.paused"
			:style="{
				position: 'absolute',
				width: '100vw',
				justifyContent: 'center',
				marginTop: pauseMarginTop,
			}"
		>
			<Text class="text-yellow font-bold bg-red">
				{{ '  ' }}══ PAUSED ══ (P to resume){{ '  ' }}
			</Text>
		</Box>

		<!-- Footer - status bar -->
		<Box
			:style="{
				flexShrink: 0,
				flexDirection: 'row',
				justifyContent: 'space-between',
				paddingLeft: 2,
				paddingRight: 2,
				backgroundColor: BRAND.bgAccent,
				paddingTop: 1,
			}"
		>
			<KillLog :kills="state.kills.slice(-3)" />
			<Controls />
		</Box>

		<Alert v-if="!isRawModeSupported" variant="warning" title="Warning">
			Raw mode not supported — input may be limited
		</Alert>
	</Box>
</template>
