import { useEffect, useRef, useState } from 'react'
import { Box, Text, Spinner, Alert, useInput, useStdin } from '@wolfie/react'
import { GameCanvas } from '../components/GameCanvas'
import { HUD } from '../components/HUD'
import { KillLog } from '../components/KillLog'
import { Controls } from '../components/Controls'
import { useGameLoop } from '../hooks/useGameLoop'
import type { State, Screen } from '../hooks/useInvaders'
import { ALIEN_SHOOT_INTERVAL } from '../constants'
import { debugLog } from '../debug'
import { BRAND } from '../theme'

//#region Types
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
//#endregion Types

//#region Component
export function Game({
	state,
	onTick,
	onMovePlayer,
	onShoot,
	onAlienShoot,
	onPause,
	onNextWave,
	onNavigate,
}: GameProps) {
	const { isRawModeSupported } = useStdin()
	const [fps, setFps] = useState(0)
	const lastFrameTime = useRef(Date.now())
	const frameCount = useRef(0)

	// FPS calculation
	useEffect(() => {
		frameCount.current++
		const now = Date.now()
		const elapsed = now - lastFrameTime.current

		if (elapsed >= 1000) {
			setFps(Math.round((frameCount.current * 1000) / elapsed))
			frameCount.current = 0
			lastFrameTime.current = now
		}
	}, [state.frame])

	// Game loop
	useGameLoop({
		onTick,
		isRunning: !state.paused && !state.waveTransition,
	})

	// Alien shooting
	useEffect(() => {
		if (state.paused || state.waveTransition) return

		const interval = setInterval(() => {
			onAlienShoot()
		}, ALIEN_SHOOT_INTERVAL)

		return () => clearInterval(interval)
	}, [state.paused, state.waveTransition, onAlienShoot])

	// Wave transition
	useEffect(() => {
		if (state.waveTransition) {
			const timer = setTimeout(() => {
				onNextWave()
			}, 2000)
			return () => clearTimeout(timer)
		}
	}, [state.waveTransition, onNextWave])

	// Input handling
	useInput(
		(input, key) => {
			if (input === 'p') {
				onPause()
				return
			}

			if (input === 'q') {
				onNavigate('menu')
				return
			}

			if (state.paused) return

			if (key.leftArrow) {
				onMovePlayer(-1)
			} else if (key.rightArrow) {
				onMovePlayer(1)
			} else if (input === ' ') {
				debugLog('Input: SPACE pressed')
				onShoot()
			}
		},
		{ isActive: true }
	)

	// Wave transition screen
	if (state.waveTransition) {
		return (
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
				<Alert variant="success" title="Wave Complete!">
					Excellent work, Commander! Preparing next wave…
				</Alert>

				<Box style={{ marginTop: 2 }}>
					<Spinner type="dots" />
					<Text className="text-cyan ml-2">
						{' '}
						Loading Wave {state.wave + 1}…
					</Text>
				</Box>

				<Box style={{ marginTop: 2 }}>
					<Text className="text-yellow font-bold">Score: {state.score}</Text>
				</Box>
			</Box>
		)
	}

	return (
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
					paddingLeft: 1,
					paddingRight: 1,
					backgroundColor: BRAND.bgDark,
				}}
			>
				<HUD
					score={state.score}
					lives={state.lives}
					wave={state.wave}
					showFps={state.settings.showFps}
					fps={fps}
				/>
			</Box>

			{/* Main game area - full width */}
			<Box style={{ flexGrow: 1, flexDirection: 'column' }}>
				<GameCanvas
					aliens={state.aliens}
					bullets={state.bullets}
					shields={state.shields}
					playerX={state.player.x}
					frame={state.frame}
					boardWidth={state.board.width}
					boardHeight={state.board.height}
				/>
			</Box>

			{/* Pause indicator - overlay style */}
			{state.paused && (
				<Box
					style={{
						position: 'absolute',
						width: '100vw',
						justifyContent: 'center',
						marginTop: Math.floor(state.board.height / 2),
					}}
				>
					<Text className="text-yellow font-bold bg-red">
						{'  '}══ PAUSED ══ (P to resume){'  '}
					</Text>
				</Box>
			)}

			{/* Footer - status bar */}
			<Box
				style={{
					flexDirection: 'row',
					justifyContent: 'space-between',
					paddingLeft: 2,
					paddingRight: 2,
					backgroundColor: BRAND.bgAccent,
					paddingTop: 1,
				}}
			>
				<KillLog kills={state.kills.slice(-3)} />
				<Controls />
			</Box>

			{!isRawModeSupported && (
				<Alert variant="warning" title="Warning">
					Raw mode not supported — input may be limited
				</Alert>
			)}
		</Box>
	)
}
//#endregion Component
