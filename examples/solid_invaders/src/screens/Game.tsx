import { createSignal, createEffect, createMemo, on, onCleanup } from 'solid-js'
import { Box, Text, Show, useInput, useStdin } from '@wolfie/solid'
import GameCanvas from '../components/GameCanvas'
import HUD from '../components/HUD'
import KillLog from '../components/KillLog'
import Controls from '../components/Controls'
import { useGameLoop } from '../composables/useGameLoop'
import type { State, Screen } from '../composables/useInvaders'
import { ALIEN_SHOOT_INTERVAL } from '../constants'
import { debugLog } from '../debug'
import { BRAND } from '../theme'

//#region Props
type GameProps = {
	state: State
	onTick: () => void
	onMovePlayer: (dx: number) => void
	onShoot: () => void
	onAlienShoot: () => void
	onPause: () => void
	onNextWave: () => void
	onNavigate: (screen: Screen) => void
}
//#endregion Props

//#region Component
export default function Game(props: GameProps) {
	const { isRawModeSupported } = useStdin()
	const [fps, setFps] = createSignal(0)
	let lastFrameTime = Date.now()
	let frameCount = 0

	//#region FPS Calculation
	createEffect(
		on(
			() => props.state.frame,
			() => {
				frameCount++
				const now = Date.now()
				const elapsed = now - lastFrameTime

				if (elapsed >= 1000) {
					setFps(Math.round((frameCount * 1000) / elapsed))
					frameCount = 0
					lastFrameTime = now
				}
			}
		)
	)
	//#endregion FPS Calculation

	//#region Game Loop
	const isRunning = createMemo(
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

	createEffect(
		on(
			() => [props.state.paused, props.state.waveTransition],
			([paused, waveTransition]) => {
				if (paused || waveTransition) {
					stopAlienShooting()
				} else {
					startAlienShooting()
				}
			}
		)
	)
	// Start immediately if running
	if (!props.state.paused && !props.state.waveTransition) {
		startAlienShooting()
	}

	onCleanup(() => {
		stopAlienShooting()
	})
	//#endregion Alien Shooting

	//#region Wave Transition
	createEffect(
		on(
			() => props.state.waveTransition,
			(waveTransition) => {
				if (waveTransition) {
					const timer = setTimeout(() => {
						props.onNextWave()
					}, 2000)
					onCleanup(() => clearTimeout(timer))
				}
			}
		)
	)
	//#endregion Wave Transition

	//#region Input Handling
	useInput((input, key) => {
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
	})
	//#endregion Input Handling

	//#region Computed
	const pauseMarginTop = createMemo(() =>
		Math.floor(props.state.board.height / 2)
	)
	//#endregion Computed

	return (
		<>
			{/* Wave transition screen */}
			<Show when={props.state.waveTransition}>
				<Box
					style={{
						width: '100vw',
						height: '100vh',
						flexDirection: 'column',
						alignItems: 'center',
						justifyContent: 'center',
						backgroundColor: BRAND.bgAccent,
					}}
				>
					<Box
						style={{
							flexDirection: 'column',
							alignItems: 'center',
							borderStyle: 'round',
							borderColor: BRAND.success,
							paddingLeft: 2,
							paddingRight: 2,
							paddingTop: 1,
							paddingBottom: 1,
						}}
					>
						<Text style={{ color: BRAND.success }} className="font-bold">
							✓ Wave Complete!
						</Text>
						<Text>Excellent work, Commander! Preparing next wave…</Text>
					</Box>

					<Box style={{ marginTop: 2 }}>
						<Text className="text-cyan">
							Loading Wave {props.state.wave + 1}…
						</Text>
					</Box>

					<Box style={{ marginTop: 2 }}>
						<Text className="text-yellow font-bold">
							Score: {props.state.score}
						</Text>
					</Box>
				</Box>
			</Show>

			{/* Main game screen */}
			<Show when={!props.state.waveTransition}>
				<Box
					style={{
						width: '100vw',
						height: '100vh',
						flexDirection: 'column',
						backgroundColor: BRAND.bgDark,
					}}
				>
					{/* Header */}
					<Box
						style={{
							flexShrink: 0,
							paddingLeft: 1,
							paddingRight: 1,
							backgroundColor: BRAND.bgDark,
						}}
					>
						<HUD
							score={props.state.score}
							lives={props.state.lives}
							wave={props.state.wave}
							showFps={props.state.settings.showFps}
							fps={fps()}
						/>
					</Box>

					{/* Main game area */}
					<Box
						style={{
							flexGrow: 1,
							flexDirection: 'column',
							minHeight: 0,
							overflow: 'hidden',
						}}
					>
						<GameCanvas
							aliens={props.state.aliens}
							bullets={props.state.bullets}
							shields={props.state.shields}
							playerX={props.state.player.x}
							frame={props.state.frame}
							boardWidth={props.state.board.width}
							boardHeight={props.state.board.height}
						/>
					</Box>

					{/* Pause indicator */}
					<Show when={props.state.paused}>
						<Box
							style={{
								position: 'absolute',
								width: '100vw',
								justifyContent: 'center',
								marginTop: pauseMarginTop(),
							}}
						>
							<Text className="text-yellow font-bold bg-red">
								{'  '}══ PAUSED ══ (P to resume){'  '}
							</Text>
						</Box>
					</Show>

					{/* Footer */}
					<Box
						style={{
							flexShrink: 0,
							flexDirection: 'row',
							justifyContent: 'space-between',
							paddingLeft: 2,
							paddingRight: 2,
							backgroundColor: BRAND.bgAccent,
							paddingTop: 1,
						}}
					>
						<KillLog kills={props.state.kills.slice(-3)} />
						<Controls />
					</Box>

					<Show when={!isRawModeSupported}>
						<Box
							style={{
								borderStyle: 'round',
								borderColor: BRAND.warning,
								paddingLeft: 1,
								paddingRight: 1,
							}}
						>
							<Text style={{ color: BRAND.warning }}>
								⚠ Raw mode not supported — input may be limited
							</Text>
						</Box>
					</Show>
				</Box>
			</Show>
		</>
	)
}
//#endregion Component
