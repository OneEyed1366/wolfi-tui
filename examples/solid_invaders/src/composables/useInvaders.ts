import { createSignal, createEffect, type Accessor } from 'solid-js'
import { debugTime } from '../debug'
import {
	INITIAL_ALIEN_MOVE_INTERVAL,
	MIN_ALIEN_MOVE_INTERVAL,
	BULLET_SPEED,
	POINTS_PER_WAVE,
} from '../constants'

//#region Re-exports from game modules
export type {
	BoardConfig,
	Alien,
	Bullet,
	ShieldCell,
	Shield,
	Kill,
	Screen,
	Difficulty,
	Settings,
	State,
} from './game/types'
//#endregion Re-exports from game modules

import type { Bullet, Screen, Settings, State } from './game/types'
import { createBoardConfig } from './game/board'
import { createAliens, createShields } from './game/entities'
import {
	getAlienPoints,
	getDifficultyModifier,
	createInitialState,
} from './game/state'

//#region Composable
export function useInvaders(
	termWidth: Accessor<number>,
	termHeight: Accessor<number>
) {
	const initialBoard = createBoardConfig(termWidth(), termHeight())
	const [state, setState] = createSignal<State>(
		createInitialState(initialBoard)
	)

	// Watch for terminal resize
	createEffect(() => {
		const width = termWidth()
		const height = termHeight()
		const newBoard = createBoardConfig(width, height)
		setState((prev) => {
			if (prev.screen === 'menu') {
				return {
					...prev,
					board: newBoard,
					player: { x: Math.floor(newBoard.width / 2) },
				}
			}
			return { ...prev, board: newBoard }
		})
	})

	//#region Actions
	function navigate(screen: Screen) {
		setState((prev) => ({ ...prev, screen }))
	}

	function startGame() {
		setState((prev) => {
			const board = prev.board
			const savedSettings = { ...prev.settings }
			const newState = createInitialState(board)
			return {
				...newState,
				screen: 'game' as const,
				aliens: createAliens(board),
				shields: createShields(board),
				settings: savedSettings,
				gameStartTime: Date.now(),
			}
		})
	}

	function tick() {
		debugTime('Action:TICK', () => {
			setState((prev) => {
				if (prev.paused || prev.waveTransition) {
					return { ...prev, frame: prev.frame + 1 }
				}

				const s = { ...prev }
				const { board } = s
				s.frame = s.frame + 1

				// Move bullets
				s.bullets = s.bullets
					.map((b) => ({
						...b,
						y: b.y + b.dy * BULLET_SPEED,
					}))
					.filter((b) => b.y > 0 && b.y < board.height - board.padding)

				// Move aliens
				s.alienMoveTimer = s.alienMoveTimer + 1
				const diffMod = getDifficultyModifier(s.settings.difficulty)
				const adjustedInterval = Math.floor(s.alienMoveInterval * diffMod)

				if (s.alienMoveTimer >= Math.floor(adjustedInterval / 50)) {
					s.alienMoveTimer = 0

					const aliveAliens = s.aliens.filter((a) => a.alive)
					if (aliveAliens.length > 0) {
						const minX = Math.min(...aliveAliens.map((a) => a.x))
						const maxX = Math.max(...aliveAliens.map((a) => a.x))

						let moveDown = false
						let newDir = s.alienDir

						if (
							(s.alienDir === 1 && maxX >= board.width - board.padding - 2) ||
							(s.alienDir === -1 && minX <= board.padding + 1)
						) {
							moveDown = true
							newDir = (s.alienDir * -1) as 1 | -1
						}

						s.aliens = s.aliens.map((a) => {
							if (!a.alive) return a
							return {
								...a,
								x: moveDown ? a.x : a.x + newDir * board.alienStepX,
								y: moveDown ? a.y + board.alienStepY : a.y,
							}
						})

						s.alienDir = newDir
					}
				}

				// Check collisions
				const playerBullets = s.bullets.filter((b) => b.dy === -1)
				const alienBullets = s.bullets.filter((b) => b.dy === 1)

				// Deep clone aliens for mutation
				s.aliens = s.aliens.map((a) => ({ ...a }))

				// Player bullets vs aliens
				const newKills: State['kills'] = []
				const totalAliens = board.alienRows * board.alienCols
				for (const bullet of playerBullets) {
					for (const alien of s.aliens) {
						if (
							alien.alive &&
							Math.abs(bullet.x - alien.x) <= 1 &&
							Math.abs(bullet.y - alien.y) <= 1
						) {
							alien.alive = false
							s.bullets = s.bullets.filter((b) => b.id !== bullet.id)
							const points = getAlienPoints(alien.type)
							s.score = s.score + points
							newKills.push({
								id: `kill-${Date.now()}-${alien.id}`,
								alien: { ...alien },
								timestamp: Date.now(),
								points,
							})

							const aliveCount = s.aliens.filter((a) => a.alive).length
							const speedFactor = 1 - (totalAliens - aliveCount) / totalAliens
							s.alienMoveInterval = Math.max(
								MIN_ALIEN_MOVE_INTERVAL,
								INITIAL_ALIEN_MOVE_INTERVAL * speedFactor
							)
							break
						}
					}
				}
				if (newKills.length > 0) {
					s.kills = [...s.kills, ...newKills].slice(-10)
				}

				// Alien bullets vs player
				for (const bullet of alienBullets) {
					if (
						Math.abs(bullet.x - s.player.x) <= 1 &&
						bullet.y >= board.height - board.padding - 2
					) {
						s.lives = s.lives - 1
						s.bullets = s.bullets.filter((b) => b.id !== bullet.id)
						if (s.lives <= 0) {
							return { ...s, screen: 'gameover' as const }
						}
					}
				}

				// Bullets vs shields - deep clone shields
				s.shields = s.shields.map((shield) => ({
					...shield,
					cells: shield.cells.map((cell) => ({ ...cell })),
				}))
				for (const bullet of s.bullets) {
					for (const shield of s.shields) {
						for (const cell of shield.cells) {
							if (
								cell.health > 0 &&
								Math.abs(bullet.x - cell.x) < 1 &&
								Math.abs(bullet.y - cell.y) < 1
							) {
								cell.health -= 1
								s.bullets = s.bullets.filter((b) => b.id !== bullet.id)
								break
							}
						}
					}
				}

				// Check alien reach bottom
				const maxAlienY = Math.max(
					...s.aliens.filter((a) => a.alive).map((a) => a.y),
					0
				)
				if (maxAlienY >= board.height - board.shieldYOffset) {
					return { ...s, screen: 'gameover' as const }
				}

				// Check wave complete
				if (s.aliens.every((a) => !a.alive)) {
					s.waveTransition = true
					s.score = s.score + POINTS_PER_WAVE
				}

				return s
			})
		})
	}

	function movePlayer(dx: number) {
		debugTime('Action:MOVE_PLAYER', () => {
			setState((prev) => {
				const { board } = prev
				const newX = Math.max(
					board.padding + 1,
					Math.min(
						board.width - board.padding - 2,
						prev.player.x + dx * board.playerSpeed
					)
				)
				return { ...prev, player: { x: newX } }
			})
		})
	}

	function shoot() {
		debugTime('Action:SHOOT', () => {
			const now = Date.now()
			setState((prev) => {
				if (now - prev.lastShootTime < 250) return prev

				const { board } = prev
				const newBullet: Bullet = {
					id: `bullet-player-${now}`,
					x: prev.player.x,
					y: board.height - board.padding - 3,
					dy: -1,
				}
				return {
					...prev,
					bullets: [...prev.bullets, newBullet],
					lastShootTime: now,
				}
			})
		})
	}

	function alienShoot() {
		debugTime('Action:ALIEN_SHOOT', () => {
			setState((prev) => {
				const aliveAliens = prev.aliens.filter((a) => a.alive)
				if (aliveAliens.length === 0) return prev

				const { board } = prev
				const columnMap = new Map<number, (typeof aliveAliens)[0]>()
				for (const alien of aliveAliens) {
					const col = Math.floor(alien.x / board.alienSpacingX)
					const existing = columnMap.get(col)
					if (!existing || alien.y > existing.y) {
						columnMap.set(col, alien)
					}
				}
				const bottomAliens = [...columnMap.values()]

				if (bottomAliens.length === 0) return prev

				const shooter =
					bottomAliens[Math.floor(Math.random() * bottomAliens.length)]
				if (!shooter) return prev

				const newBullet: Bullet = {
					id: `bullet-alien-${Date.now()}`,
					x: shooter.x,
					y: shooter.y + 1,
					dy: 1,
				}

				return { ...prev, bullets: [...prev.bullets, newBullet] }
			})
		})
	}

	function pause() {
		setState((prev) => ({ ...prev, paused: !prev.paused }))
	}

	function nextWave() {
		debugTime('Action:NEXT_WAVE', () => {
			setState((prev) => {
				const { board } = prev
				const newWave = prev.wave + 1
				return {
					...prev,
					wave: newWave,
					waveTransition: false,
					aliens: createAliens(board),
					shields: createShields(board),
					bullets: [],
					alienDir: 1 as const,
					alienMoveTimer: 0,
					alienMoveInterval: Math.max(
						MIN_ALIEN_MOVE_INTERVAL,
						INITIAL_ALIEN_MOVE_INTERVAL - newWave * 50
					),
				}
			})
		})
	}

	function updateSettings(settings: Partial<Settings>) {
		setState((prev) => ({
			...prev,
			settings: { ...prev.settings, ...settings },
		}))
	}

	function restart() {
		setState((prev) => {
			const board = prev.board
			const savedSettings = { ...prev.settings }
			const newState = createInitialState(board)
			return {
				...newState,
				screen: 'game' as const,
				aliens: createAliens(board),
				shields: createShields(board),
				settings: savedSettings,
				gameStartTime: Date.now(),
			}
		})
	}
	//#endregion Actions

	return {
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
	}
}
//#endregion Composable
