import { reactive, readonly, watch, type Ref } from 'vue'
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
export function useInvaders(termWidth: Ref<number>, termHeight: Ref<number>) {
	const initialBoard = createBoardConfig(termWidth.value, termHeight.value)
	const state = reactive<State>(createInitialState(initialBoard))

	// Watch for terminal resize
	watch([termWidth, termHeight], ([width, height]) => {
		const newBoard = createBoardConfig(width, height)
		// Only recreate if in menu (don't disrupt active game)
		if (state.screen === 'menu') {
			Object.assign(state, {
				board: newBoard,
				player: { x: Math.floor(newBoard.width / 2) },
			})
		} else {
			state.board = newBoard
		}
	})

	//#region Actions
	function navigate(screen: Screen) {
		state.screen = screen
	}

	function startGame() {
		const board = state.board
		const savedSettings = { ...state.settings }
		Object.assign(state, createInitialState(board))
		state.screen = 'game'
		state.aliens = createAliens(board)
		state.shields = createShields(board)
		Object.assign(state.settings, savedSettings)
		state.gameStartTime = Date.now()
	}

	function tick() {
		if (state.paused || state.waveTransition) {
			state.frame += 1
			return
		}

		const { board } = state
		state.frame += 1

		// Move bullets
		state.bullets = state.bullets
			.map((b) => ({
				...b,
				y: b.y + b.dy * BULLET_SPEED,
			}))
			.filter((b) => b.y > 0 && b.y < board.height - board.padding)

		// Move aliens
		state.alienMoveTimer += 1
		const diffMod = getDifficultyModifier(state.settings.difficulty)
		const adjustedInterval = Math.floor(state.alienMoveInterval * diffMod)

		if (state.alienMoveTimer >= Math.floor(adjustedInterval / 50)) {
			state.alienMoveTimer = 0

			const aliveAliens = state.aliens.filter((a) => a.alive)
			if (aliveAliens.length > 0) {
				const minX = Math.min(...aliveAliens.map((a) => a.x))
				const maxX = Math.max(...aliveAliens.map((a) => a.x))

				let moveDown = false
				let newDir = state.alienDir

				if (
					(state.alienDir === 1 && maxX >= board.width - board.padding - 2) ||
					(state.alienDir === -1 && minX <= board.padding + 1)
				) {
					moveDown = true
					newDir = (state.alienDir * -1) as 1 | -1
				}

				state.aliens = state.aliens.map((a) => {
					if (!a.alive) return a
					return {
						...a,
						x: moveDown ? a.x : a.x + newDir * board.alienStepX,
						y: moveDown ? a.y + board.alienStepY : a.y,
					}
				})

				state.alienDir = newDir
			}
		}

		// Check collisions
		const playerBullets = state.bullets.filter((b) => b.dy === -1)
		const alienBullets = state.bullets.filter((b) => b.dy === 1)

		// Player bullets vs aliens
		const newKills: State['kills'] = []
		const totalAliens = board.alienRows * board.alienCols
		for (const bullet of playerBullets) {
			for (const alien of state.aliens) {
				if (
					alien.alive &&
					Math.abs(bullet.x - alien.x) <= 1 &&
					Math.abs(bullet.y - alien.y) <= 1
				) {
					alien.alive = false
					state.bullets = state.bullets.filter((b) => b.id !== bullet.id)
					const points = getAlienPoints(alien.type)
					state.score += points
					newKills.push({
						id: `kill-${Date.now()}-${alien.id}`,
						alien: { ...alien },
						timestamp: Date.now(),
						points,
					})

					// Speed up aliens as more die
					const aliveCount = state.aliens.filter((a) => a.alive).length
					const speedFactor = 1 - (totalAliens - aliveCount) / totalAliens
					state.alienMoveInterval = Math.max(
						MIN_ALIEN_MOVE_INTERVAL,
						INITIAL_ALIEN_MOVE_INTERVAL * speedFactor
					)
					break
				}
			}
		}
		if (newKills.length > 0) {
			state.kills = [...state.kills, ...newKills].slice(-10)
		}

		// Alien bullets vs player
		for (const bullet of alienBullets) {
			if (
				Math.abs(bullet.x - state.player.x) <= 1 &&
				bullet.y >= board.height - board.padding - 2
			) {
				state.lives -= 1
				state.bullets = state.bullets.filter((b) => b.id !== bullet.id)
				if (state.lives <= 0) {
					state.screen = 'gameover'
					return
				}
			}
		}

		// Bullets vs shields
		for (const bullet of state.bullets) {
			for (const shield of state.shields) {
				for (const cell of shield.cells) {
					if (
						cell.health > 0 &&
						Math.abs(bullet.x - cell.x) < 1 &&
						Math.abs(bullet.y - cell.y) < 1
					) {
						cell.health -= 1
						state.bullets = state.bullets.filter((b) => b.id !== bullet.id)
						break
					}
				}
			}
		}

		// Check alien reach bottom
		const maxAlienY = Math.max(
			...state.aliens.filter((a) => a.alive).map((a) => a.y),
			0
		)
		if (maxAlienY >= board.height - board.shieldYOffset) {
			state.screen = 'gameover'
			return
		}

		// Check wave complete
		if (state.aliens.every((a) => !a.alive)) {
			state.waveTransition = true
			state.score += POINTS_PER_WAVE
		}
	}

	function movePlayer(dx: number) {
		const { board } = state
		const newX = Math.max(
			board.padding + 1,
			Math.min(
				board.width - board.padding - 2,
				state.player.x + dx * board.playerSpeed
			)
		)
		state.player.x = newX
	}

	function shoot() {
		const now = Date.now()
		if (now - state.lastShootTime < 250) return

		const { board } = state
		const newBullet: Bullet = {
			id: `bullet-player-${now}`,
			x: state.player.x,
			y: board.height - board.padding - 3,
			dy: -1,
		}
		state.bullets.push(newBullet)
		state.lastShootTime = now
	}

	function alienShoot() {
		const aliveAliens = state.aliens.filter((a) => a.alive)
		if (aliveAliens.length === 0) return

		const { board } = state
		const bottomAliens: State['aliens'] = []
		const columnMap = new Map<number, State['aliens'][0]>()
		for (const alien of aliveAliens) {
			const col = Math.floor(alien.x / board.alienSpacingX)
			const existing = columnMap.get(col)
			if (!existing || alien.y > existing.y) {
				columnMap.set(col, alien)
			}
		}
		bottomAliens.push(...columnMap.values())

		if (bottomAliens.length === 0) return

		const shooter =
			bottomAliens[Math.floor(Math.random() * bottomAliens.length)]
		if (!shooter) return

		const newBullet: Bullet = {
			id: `bullet-alien-${Date.now()}`,
			x: shooter.x,
			y: shooter.y + 1,
			dy: 1,
		}

		state.bullets.push(newBullet)
	}

	function pause() {
		state.paused = !state.paused
	}

	function nextWave() {
		const { board } = state
		const newWave = state.wave + 1
		state.wave = newWave
		state.waveTransition = false
		state.aliens = createAliens(board)
		state.shields = createShields(board)
		state.bullets = []
		state.alienDir = 1
		state.alienMoveTimer = 0
		state.alienMoveInterval = Math.max(
			MIN_ALIEN_MOVE_INTERVAL,
			INITIAL_ALIEN_MOVE_INTERVAL - newWave * 50
		)
	}

	function updateSettings(settings: Partial<Settings>) {
		Object.assign(state.settings, settings)
	}

	function restart() {
		const board = state.board
		const savedSettings = { ...state.settings }
		Object.assign(state, createInitialState(board))
		state.screen = 'game'
		state.aliens = createAliens(board)
		state.shields = createShields(board)
		Object.assign(state.settings, savedSettings)
		state.gameStartTime = Date.now()
	}
	//#endregion Actions

	return {
		state: readonly(state),
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
