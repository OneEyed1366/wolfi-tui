import { reactive, readonly, watch, type Ref } from 'vue'
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
		const settings = state.settings
		Object.assign(state, createInitialState(board))
		state.screen = 'game'
		state.aliens = createAliens(board)
		state.shields = createShields(board)
		state.settings = settings
		state.gameStartTime = Date.now()
	}

	function tick() {
		debugTime('Action:TICK', () => {
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
			const newKills: Kill[] = []
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
		})
	}

	function movePlayer(dx: number) {
		debugTime('Action:MOVE_PLAYER', () => {
			const { board } = state
			const newX = Math.max(
				board.padding + 1,
				Math.min(
					board.width - board.padding - 2,
					state.player.x + dx * board.playerSpeed
				)
			)
			state.player.x = newX
		})
	}

	function shoot() {
		debugTime('Action:SHOOT', () => {
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
		})
	}

	function alienShoot() {
		debugTime('Action:ALIEN_SHOOT', () => {
			const aliveAliens = state.aliens.filter((a) => a.alive)
			if (aliveAliens.length === 0) return

			const { board } = state
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
		})
	}

	function pause() {
		state.paused = !state.paused
	}

	function nextWave() {
		debugTime('Action:NEXT_WAVE', () => {
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
		})
	}

	function updateSettings(settings: Partial<Settings>) {
		Object.assign(state.settings, settings)
	}

	function restart() {
		const board = state.board
		const settings = state.settings
		Object.assign(state, createInitialState(board))
		state.screen = 'game'
		state.aliens = createAliens(board)
		state.shields = createShields(board)
		state.settings = settings
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
