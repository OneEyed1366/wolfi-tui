import { Injectable, signal, computed, effect } from '@angular/core'
import {
	INITIAL_ALIEN_MOVE_INTERVAL,
	MIN_ALIEN_MOVE_INTERVAL,
	BULLET_SPEED,
	POINTS_PER_WAVE,
	TICK_INTERVAL,
	ALIEN_SHOOT_INTERVALS,
	WAVE_TRANSITION_DELAY,
} from '../constants'
import type {
	Action,
	Bullet,
	Kill,
	Screen,
	Settings,
	State,
} from '../game/types'
import { createBoardConfig } from '../game/board'
import { createAliens, createShields } from '../game/entities'
import {
	getAlienPoints,
	getDifficultyModifier,
	createInitialState,
} from '../game/state'

//#region Reducer
function reducerImpl(state: State, action: Action): State {
	const { board } = state

	switch (action.type) {
		case 'NAVIGATE':
			return { ...state, screen: action.screen }

		case 'RESIZE': {
			const newBoard = createBoardConfig(action.width, action.height)
			// Only recreate if in menu (don't disrupt active game)
			if (state.screen === 'menu') {
				return {
					...state,
					board: newBoard,
					player: { x: Math.floor(newBoard.width / 2) },
				}
			}
			return { ...state, board: newBoard }
		}

		case 'START_GAME': {
			return {
				...createInitialState(board),
				screen: 'game',
				aliens: createAliens(board),
				shields: createShields(board),
				settings: { ...state.settings },
				gameStartTime: Date.now(),
			}
		}

		case 'TICK': {
			if (state.paused || state.waveTransition) {
				return { ...state, frame: state.frame + 1 }
			}

			const newState = { ...state, frame: state.frame + 1 }

			// Move bullets
			const updatedBullets = newState.bullets
				.map((b) => ({
					...b,
					y: b.y + b.dy * BULLET_SPEED,
				}))
				.filter((b) => b.y > 0 && b.y < board.height - board.padding)

			newState.bullets = updatedBullets

			// Move aliens
			newState.alienMoveTimer += 1
			const diffMod = getDifficultyModifier(state.settings.difficulty)
			const adjustedInterval = Math.floor(newState.alienMoveInterval * diffMod)

			if (newState.alienMoveTimer >= Math.floor(adjustedInterval / 50)) {
				newState.alienMoveTimer = 0

				const aliveAliens = newState.aliens.filter((a) => a.alive)
				if (aliveAliens.length > 0) {
					const minX = Math.min(...aliveAliens.map((a) => a.x))
					const maxX = Math.max(...aliveAliens.map((a) => a.x))

					let moveDown = false
					let newDir = newState.alienDir

					if (
						(newState.alienDir === 1 &&
							maxX >= board.width - board.padding - 2) ||
						(newState.alienDir === -1 && minX <= board.padding + 1)
					) {
						moveDown = true
						newDir = (newState.alienDir * -1) as 1 | -1
					}

					newState.aliens = newState.aliens.map((a) => {
						if (!a.alive) return a
						return {
							...a,
							x: moveDown ? a.x : a.x + newDir * board.alienStepX,
							y: moveDown ? a.y + board.alienStepY : a.y,
						}
					})

					newState.alienDir = newDir
				}
			}

			// Deep-clone aliens and shields before collision checks to prevent mutation bugs
			newState.aliens = newState.aliens.map((a) => ({ ...a }))
			newState.shields = newState.shields.map((s) => ({
				...s,
				cells: s.cells.map((c) => ({ ...c })),
			}))

			// Check collisions
			const playerBullets = newState.bullets.filter((b) => b.dy === -1)
			const alienBullets = newState.bullets.filter((b) => b.dy === 1)

			// Player bullets vs aliens
			const newKills: Kill[] = []
			const totalAliens = board.alienRows * board.alienCols
			for (const bullet of playerBullets) {
				for (const alien of newState.aliens) {
					if (
						alien.alive &&
						Math.abs(bullet.x - alien.x) <= 1 &&
						Math.abs(bullet.y - alien.y) <= 1
					) {
						alien.alive = false
						newState.bullets = newState.bullets.filter(
							(b) => b.id !== bullet.id
						)
						const points = getAlienPoints(alien.type)
						newState.score += points
						newKills.push({
							id: `kill-${Date.now()}-${alien.id}`,
							alien: { ...alien },
							timestamp: Date.now(),
							points,
						})

						// Speed up aliens as more die
						const aliveCount = newState.aliens.filter((a) => a.alive).length
						const speedFactor = 1 - (totalAliens - aliveCount) / totalAliens
						newState.alienMoveInterval = Math.max(
							MIN_ALIEN_MOVE_INTERVAL,
							INITIAL_ALIEN_MOVE_INTERVAL * speedFactor
						)
						break
					}
				}
			}
			if (newKills.length > 0) {
				newState.kills = [...newState.kills, ...newKills].slice(-10)
			}

			// Alien bullets vs player
			for (const bullet of alienBullets) {
				if (
					Math.abs(bullet.x - newState.player.x) <= 1 &&
					bullet.y >= board.height - board.padding - 2
				) {
					newState.lives -= 1
					newState.bullets = newState.bullets.filter((b) => b.id !== bullet.id)
					if (newState.lives <= 0) {
						return { ...newState, screen: 'gameover' }
					}
				}
			}

			// Bullets vs shields
			for (const bullet of newState.bullets) {
				for (const shield of newState.shields) {
					for (const cell of shield.cells) {
						if (
							cell.health > 0 &&
							Math.abs(bullet.x - cell.x) < 1 &&
							Math.abs(bullet.y - cell.y) < 1
						) {
							cell.health -= 1
							newState.bullets = newState.bullets.filter(
								(b) => b.id !== bullet.id
							)
							break
						}
					}
				}
			}

			// Check alien reach bottom
			const maxAlienY = Math.max(
				...newState.aliens.filter((a) => a.alive).map((a) => a.y),
				0
			)
			if (maxAlienY >= board.height - board.shieldYOffset) {
				return { ...newState, screen: 'gameover' }
			}

			// Check wave complete
			if (newState.aliens.every((a) => !a.alive)) {
				return {
					...newState,
					waveTransition: true,
					score: newState.score + POINTS_PER_WAVE,
				}
			}

			return newState
		}

		case 'MOVE_PLAYER': {
			const newX = Math.max(
				board.padding + 1,
				Math.min(
					board.width - board.padding - 2,
					state.player.x + action.dx * board.playerSpeed
				)
			)
			return { ...state, player: { x: newX } }
		}

		case 'SHOOT': {
			const now = Date.now()
			if (now - state.lastShootTime < 250) return state

			const newBullet: Bullet = {
				id: `bullet-player-${now}`,
				x: state.player.x,
				y: board.height - board.padding - 3,
				dy: -1,
			}
			return {
				...state,
				bullets: [...state.bullets, newBullet],
				lastShootTime: now,
			}
		}

		case 'ALIEN_SHOOT': {
			const aliveAliens = state.aliens.filter((a) => a.alive)
			if (aliveAliens.length === 0) return state

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

			if (bottomAliens.length === 0) return state

			const shooter =
				bottomAliens[Math.floor(Math.random() * bottomAliens.length)]
			if (!shooter) return state

			const newBullet: Bullet = {
				id: `bullet-alien-${Date.now()}`,
				x: shooter.x,
				y: shooter.y + 1,
				dy: 1,
			}

			return { ...state, bullets: [...state.bullets, newBullet] }
		}

		case 'PAUSE':
			return { ...state, paused: !state.paused }

		case 'GAME_OVER':
			return { ...state, screen: 'gameover' }

		case 'NEXT_WAVE': {
			const newWave = state.wave + 1
			return {
				...state,
				wave: newWave,
				waveTransition: false,
				aliens: createAliens(board),
				shields: createShields(board),
				bullets: [],
				alienDir: 1,
				alienMoveTimer: 0,
				alienMoveInterval: Math.max(
					MIN_ALIEN_MOVE_INTERVAL,
					INITIAL_ALIEN_MOVE_INTERVAL - newWave * 50
				),
			}
		}

		case 'UPDATE_SETTINGS':
			return {
				...state,
				settings: { ...state.settings, ...action.settings },
			}

		case 'RESTART':
			return {
				...createInitialState(board),
				screen: 'game',
				aliens: createAliens(board),
				shields: createShields(board),
				settings: { ...state.settings },
				gameStartTime: Date.now(),
			}

		default:
			return state
	}
}
//#endregion Reducer

//#region InvadersService
@Injectable()
export class InvadersService {
	private _state = signal<State>(createInitialState(createBoardConfig(80, 24)))
	readonly state = this._state.asReadonly()

	readonly screen = computed(() => this.state().screen)
	readonly paused = computed(() => this.state().paused)
	readonly waveTransition = computed(() => this.state().waveTransition)

	constructor() {
		// Game tick — runs only on game screen
		effect((onCleanup) => {
			if (this.screen() !== 'game') return
			const timer = setInterval(() => this.tick(), TICK_INTERVAL)
			onCleanup(() => clearInterval(timer))
		})

		// Alien shooting — runs when game is active and not paused/transitioning
		effect((onCleanup) => {
			if (this.screen() !== 'game' || this.paused() || this.waveTransition())
				return
			const difficulty = this.state().settings.difficulty
			const interval = ALIEN_SHOOT_INTERVALS[difficulty] ?? 1500
			const timer = setInterval(() => this.alienShoot(), interval)
			onCleanup(() => clearInterval(timer))
		})

		// Wave transition auto-advance
		effect((onCleanup) => {
			if (!this.waveTransition()) return
			const timer = setTimeout(() => this.nextWave(), WAVE_TRANSITION_DELAY)
			onCleanup(() => clearTimeout(timer))
		})
	}

	navigate(screen: Screen) {
		this._state.update((s) => reducerImpl(s, { type: 'NAVIGATE', screen }))
	}

	startGame() {
		this._state.update((s) => reducerImpl(s, { type: 'START_GAME' }))
	}

	tick() {
		this._state.update((s) => reducerImpl(s, { type: 'TICK' }))
	}

	movePlayer(dx: number) {
		this._state.update((s) => reducerImpl(s, { type: 'MOVE_PLAYER', dx }))
	}

	shoot() {
		this._state.update((s) => reducerImpl(s, { type: 'SHOOT' }))
	}

	alienShoot() {
		this._state.update((s) => reducerImpl(s, { type: 'ALIEN_SHOOT' }))
	}

	pause() {
		this._state.update((s) => reducerImpl(s, { type: 'PAUSE' }))
	}

	nextWave() {
		this._state.update((s) => reducerImpl(s, { type: 'NEXT_WAVE' }))
	}

	resize(width: number, height: number) {
		this._state.update((s) => reducerImpl(s, { type: 'RESIZE', width, height }))
	}

	updateSettings(settings: Partial<Settings>) {
		this._state.update((s) =>
			reducerImpl(s, { type: 'UPDATE_SETTINGS', settings })
		)
	}

	restart() {
		this._state.update((s) => reducerImpl(s, { type: 'RESTART' }))
	}
}
//#endregion InvadersService
