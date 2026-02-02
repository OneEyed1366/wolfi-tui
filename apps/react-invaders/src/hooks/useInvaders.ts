import { useReducer, useCallback, useEffect } from 'react'
import { debugTime } from '../debug'
import {
	INITIAL_LIVES,
	INITIAL_ALIEN_MOVE_INTERVAL,
	MIN_ALIEN_MOVE_INTERVAL,
	BULLET_SPEED,
	POINTS_ALIEN_TOP,
	POINTS_ALIEN_MID,
	POINTS_ALIEN_BOT,
	POINTS_PER_WAVE,
	ALIEN_TYPE_TOP,
	ALIEN_TYPE_MID,
} from '../constants'

//#region Dynamic Board Config
export type BoardConfig = {
	width: number
	height: number
	padding: number
	alienRows: number
	alienCols: number
	alienSpacingX: number
	alienSpacingY: number
	alienStartY: number
	shieldCount: number
	shieldWidth: number
	shieldHeight: number
	shieldYOffset: number
	playerSpeed: number
	alienStepX: number
	alienStepY: number
}

export function createBoardConfig(
	termWidth: number,
	termHeight: number
): BoardConfig {
	// Use full terminal width, reserve header (1) + footer (4)
	const boardWidth = Math.max(60, termWidth)
	const boardHeight = Math.max(16, termHeight - 5)

	// Scale alien grid based on board size
	const alienCols = Math.max(9, Math.min(18, Math.floor(boardWidth / 7)))
	const alienRows = Math.max(4, Math.min(7, Math.floor(boardHeight / 5)))
	const alienSpacingX = Math.floor((boardWidth - 10) / alienCols)
	const alienSpacingY = 2
	const alienStartY = 2

	// Calculate where aliens end and position shields proportionally
	const alienEndY = alienStartY + alienRows * alienSpacingY
	const playerY = boardHeight - 2
	const middleSpace = playerY - alienEndY

	// Shields positioned at 70% of the way between aliens and player
	const shieldY = alienEndY + Math.floor(middleSpace * 0.7)
	const shieldYOffset = boardHeight - shieldY

	return {
		width: boardWidth,
		height: boardHeight,
		padding: 2,
		alienRows,
		alienCols,
		alienSpacingX,
		alienSpacingY,
		alienStartY,
		shieldCount: Math.max(4, Math.min(8, Math.floor(boardWidth / 18))),
		shieldWidth: 7,
		shieldHeight: 3,
		shieldYOffset,
		playerSpeed: Math.max(3, Math.floor(boardWidth / 25)),
		alienStepX: 2,
		alienStepY: 1,
	}
}
//#endregion Dynamic Board Config

//#region Types
export type Alien = {
	id: string
	x: number
	y: number
	type: 0 | 1 | 2
	alive: boolean
}

export type Bullet = {
	id: string
	x: number
	y: number
	dy: -1 | 1
}

export type ShieldCell = {
	x: number
	y: number
	health: number
}

export type Shield = {
	x: number
	y: number
	cells: ShieldCell[]
}

export type Kill = {
	id: string
	alien: Alien
	timestamp: number
	points: number
}

export type Screen =
	| 'menu'
	| 'game'
	| 'gameover'
	| 'highscores'
	| 'settings'
	| 'help'

export type Difficulty = 'easy' | 'normal' | 'hard'

export type Settings = {
	sound: boolean
	difficulty: Difficulty
	showFps: boolean
	shieldBars: boolean
	killLog: boolean
	alienAnim: boolean
	screenShake: boolean
	particles: boolean
	debug: boolean
	highContrast: boolean
	largeText: boolean
}

export type State = {
	screen: Screen
	board: BoardConfig
	player: { x: number }
	aliens: Alien[]
	bullets: Bullet[]
	shields: Shield[]
	kills: Kill[]
	alienDir: 1 | -1
	alienMoveTimer: number
	alienMoveInterval: number
	score: number
	lives: number
	wave: number
	paused: boolean
	settings: Settings
	lastShootTime: number
	waveTransition: boolean
	gameStartTime: number
	frame: number
}

export type Action =
	| { type: 'NAVIGATE'; screen: Screen }
	| { type: 'START_GAME' }
	| { type: 'TICK' }
	| { type: 'MOVE_PLAYER'; dx: number }
	| { type: 'SHOOT' }
	| { type: 'PAUSE' }
	| { type: 'GAME_OVER' }
	| { type: 'NEXT_WAVE' }
	| { type: 'UPDATE_SETTINGS'; settings: Partial<Settings> }
	| { type: 'RESTART' }
	| { type: 'ALIEN_SHOOT' }
	| { type: 'RESIZE'; width: number; height: number }
//#endregion Types

//#region Helpers
function createAliens(board: BoardConfig): Alien[] {
	const aliens: Alien[] = []
	const offsetX = Math.floor(
		(board.width - board.alienCols * board.alienSpacingX) / 2
	)

	for (let row = 0; row < board.alienRows; row++) {
		for (let col = 0; col < board.alienCols; col++) {
			const type =
				row === 0 ? ALIEN_TYPE_TOP : row < 3 ? ALIEN_TYPE_MID : (2 as 0 | 1 | 2)
			aliens.push({
				id: `alien-${row}-${col}`,
				x: offsetX + col * board.alienSpacingX,
				y: board.alienStartY + row * board.alienSpacingY,
				type,
				alive: true,
			})
		}
	}

	return aliens
}

function createShields(board: BoardConfig): Shield[] {
	const shields: Shield[] = []
	const shieldSpacing = Math.floor(board.width / (board.shieldCount + 1))
	const shieldY = board.height - board.shieldYOffset

	for (let i = 0; i < board.shieldCount; i++) {
		const shieldX = shieldSpacing * (i + 1) - Math.floor(board.shieldWidth / 2)
		const cells: ShieldCell[] = []

		for (let dy = 0; dy < board.shieldHeight; dy++) {
			for (let dx = 0; dx < board.shieldWidth; dx++) {
				if (dy === 0 && (dx === 0 || dx === board.shieldWidth - 1)) continue
				if (
					dy === board.shieldHeight - 1 &&
					dx > 0 &&
					dx < board.shieldWidth - 1
				)
					continue

				cells.push({
					x: shieldX + dx,
					y: shieldY + dy,
					health: 4,
				})
			}
		}

		shields.push({ x: shieldX, y: shieldY, cells })
	}

	return shields
}

function getAlienPoints(type: 0 | 1 | 2): number {
	switch (type) {
		case 0:
			return POINTS_ALIEN_TOP
		case 1:
			return POINTS_ALIEN_MID
		default:
			return POINTS_ALIEN_BOT
	}
}

function getDifficultyModifier(difficulty: Difficulty): number {
	switch (difficulty) {
		case 'easy':
			return 1.5
		case 'hard':
			return 0.7
		default:
			return 1
	}
}

function createInitialState(board: BoardConfig): State {
	return {
		screen: 'menu',
		board,
		player: { x: Math.floor(board.width / 2) },
		aliens: [],
		bullets: [],
		shields: [],
		kills: [],
		alienDir: 1,
		alienMoveTimer: 0,
		alienMoveInterval: INITIAL_ALIEN_MOVE_INTERVAL,
		score: 0,
		lives: INITIAL_LIVES,
		wave: 1,
		paused: false,
		settings: {
			sound: true,
			difficulty: 'normal',
			showFps: false,
			shieldBars: true,
			killLog: true,
			alienAnim: true,
			screenShake: false,
			particles: false,
			debug: false,
			highContrast: false,
			largeText: false,
		},
		lastShootTime: 0,
		waveTransition: false,
		gameStartTime: Date.now(),
		frame: 0,
	}
}
//#endregion Helpers

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
				settings: state.settings,
				gameStartTime: Date.now(),
			}
		}

		case 'TICK': {
			if (state.paused || state.waveTransition) {
				return { ...state, frame: state.frame + 1 }
			}

			let newState = { ...state, frame: state.frame + 1 }

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

			const bottomAliens: Alien[] = []
			const columnMap = new Map<number, Alien>()
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
				settings: state.settings,
				gameStartTime: Date.now(),
			}

		default:
			return state
	}
}

// Wrapper that times each action
function reducer(state: State, action: Action): State {
	return debugTime(`Action:${action.type}`, () => reducerImpl(state, action))
}
//#endregion Reducer

//#region Hook
export function useInvaders(termWidth: number, termHeight: number) {
	const initialBoard = createBoardConfig(termWidth, termHeight)
	const [state, dispatch] = useReducer(reducer, initialBoard, (board) =>
		createInitialState(board)
	)

	// Handle terminal resize
	useEffect(() => {
		dispatch({ type: 'RESIZE', width: termWidth, height: termHeight })
	}, [termWidth, termHeight])

	const navigate = useCallback((screen: Screen) => {
		dispatch({ type: 'NAVIGATE', screen })
	}, [])

	const startGame = useCallback(() => {
		dispatch({ type: 'START_GAME' })
	}, [])

	const tick = useCallback(() => {
		dispatch({ type: 'TICK' })
	}, [])

	const movePlayer = useCallback((dx: number) => {
		dispatch({ type: 'MOVE_PLAYER', dx })
	}, [])

	const shoot = useCallback(() => {
		dispatch({ type: 'SHOOT' })
	}, [])

	const alienShoot = useCallback(() => {
		dispatch({ type: 'ALIEN_SHOOT' })
	}, [])

	const pause = useCallback(() => {
		dispatch({ type: 'PAUSE' })
	}, [])

	const nextWave = useCallback(() => {
		dispatch({ type: 'NEXT_WAVE' })
	}, [])

	const updateSettings = useCallback((settings: Partial<Settings>) => {
		dispatch({ type: 'UPDATE_SETTINGS', settings })
	}, [])

	const restart = useCallback(() => {
		dispatch({ type: 'RESTART' })
	}, [])

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
//#endregion Hook
