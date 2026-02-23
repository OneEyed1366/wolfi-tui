import {
	Component,
	ChangeDetectionStrategy,
	inject,
	computed,
} from '@angular/core'
import { BoxComponent, TextComponent } from '@wolfie/angular'
import {
	ALIEN_SPRITE_FRAMES,
	PLAYER_SPRITE,
	BULLET_SPRITE_UP,
	BULLET_SPRITE_DOWN,
	SHIELD_DAMAGE_SPRITES,
} from '../constants'
import { InvadersService } from '../services/invaders.service'
import type { Alien, Bullet, Shield } from '../game/types'

//#region Types
type Cell = {
	char: string
	color: string
}

type Segment = {
	text: string
	color: string
	key: string
}

type RenderedRow = {
	rowIndex: number
	segments: Segment[]
}
//#endregion Types

//#region Color Constants
const ALIEN_COLORS = ['#ef4444', '#eab308', '#22c55e'] as const
const PLAYER_COLOR = '#06b6d4'
const BULLET_PLAYER_COLOR = '#ffffff'
const BULLET_ALIEN_COLOR = '#ef4444'
const SHIELD_COLOR = '#22c55e'
//#endregion Color Constants

//#region Canvas Helpers
function createCanvas(width: number, height: number): Cell[][] {
	const canvas: Cell[][] = []
	for (let y = 0; y < height; y++) {
		const row: Cell[] = []
		for (let x = 0; x < width; x++) {
			row.push({ char: ' ', color: '' })
		}
		canvas.push(row)
	}
	return canvas
}

function renderShields(
	canvas: Cell[][],
	shields: readonly Shield[],
	width: number,
	height: number
): void {
	for (const shield of shields) {
		for (const cell of shield.cells) {
			if (cell.health <= 0) continue
			if (cell.x < 0 || cell.x >= width || cell.y < 0 || cell.y >= height)
				continue

			const sprite =
				SHIELD_DAMAGE_SPRITES[4 - cell.health] ?? SHIELD_DAMAGE_SPRITES[0]
			const row = canvas[cell.y]
			if (row) {
				const canvasCell = row[cell.x]
				if (canvasCell) {
					canvasCell.char = sprite ?? '#'
					canvasCell.color = SHIELD_COLOR
				}
			}
		}
	}
}

function renderAliens(
	canvas: Cell[][],
	aliens: readonly Alien[],
	frame: number,
	width: number,
	height: number
): void {
	const spriteFrame = frame % 3
	for (const alien of aliens) {
		if (!alien.alive) continue
		if (alien.x < 0 || alien.x >= width || alien.y < 0 || alien.y >= height)
			continue

		const sprites = ALIEN_SPRITE_FRAMES[alien.type]
		const sprite = sprites?.[spriteFrame] ?? 'X'
		const row = canvas[alien.y]
		if (row) {
			const cell = row[alien.x]
			if (cell) {
				cell.char = sprite
				cell.color = ALIEN_COLORS[alien.type] ?? 'text-white'
			}
		}
	}
}

function renderBullets(
	canvas: Cell[][],
	bullets: readonly Bullet[],
	width: number,
	height: number
): void {
	for (const bullet of bullets) {
		if (bullet.x < 0 || bullet.x >= width || bullet.y < 0 || bullet.y >= height)
			continue
		const row = canvas[bullet.y]
		if (row) {
			const cell = row[bullet.x]
			if (cell) {
				cell.char = bullet.dy < 0 ? BULLET_SPRITE_UP : BULLET_SPRITE_DOWN
				cell.color = bullet.dy < 0 ? BULLET_PLAYER_COLOR : BULLET_ALIEN_COLOR
			}
		}
	}
}

function renderPlayer(
	canvas: Cell[][],
	x: number,
	y: number,
	width: number,
	height: number
): void {
	if (x < 0 || x >= width || y < 0 || y >= height) return
	const row = canvas[y]
	if (row) {
		const cell = row[x]
		if (cell) {
			cell.char = PLAYER_SPRITE
			cell.color = PLAYER_COLOR
		}
	}
}

function parseRow(row: Cell[], rowIndex: number): Segment[] {
	const segments: Segment[] = []
	let currentColor = ''
	let currentText = ''
	let segmentIndex = 0

	for (let x = 0; x < row.length; x++) {
		const cell = row[x]
		if (!cell) continue

		if (cell.color !== currentColor) {
			if (currentText) {
				segments.push({
					text: currentText,
					color: currentColor,
					key: `${rowIndex}-${segmentIndex++}`,
				})
			}
			currentColor = cell.color
			currentText = cell.char
		} else {
			currentText += cell.char
		}
	}

	if (currentText) {
		segments.push({
			text: currentText,
			color: currentColor,
			key: `${rowIndex}-${segmentIndex}`,
		})
	}

	return segments
}
//#endregion Canvas Helpers

//#region GameCanvasComponent
@Component({
	selector: 'app-game-canvas',
	standalone: true,
	imports: [BoxComponent, TextComponent],
	changeDetection: ChangeDetectionStrategy.OnPush,
	template: `
		<w-box
			[style]="{
				flexDirection: 'column',
				width: boardWidth(),
				height: boardHeight(),
			}"
		>
			@for (row of renderedRows(); track row.rowIndex) {
				<w-box>
					@for (seg of row.segments; track seg.key) {
						<w-text [style]="seg.color ? { color: seg.color } : {}">{{
							seg.text
						}}</w-text>
					}
				</w-box>
			}
		</w-box>
	`,
})
export class GameCanvasComponent {
	//#region DI
	private readonly invaders = inject(InvadersService)
	//#endregion DI

	//#region Computed
	readonly boardWidth = computed(() => this.invaders.state().board.width)
	readonly boardHeight = computed(() => this.invaders.state().board.height)

	renderedRows = computed<RenderedRow[]>(() => {
		const state = this.invaders.state()
		const width = state.board.width
		const height = state.board.height
		const canvas = createCanvas(width, height)

		renderShields(canvas, state.shields, width, height)
		renderAliens(canvas, state.aliens, state.frame, width, height)
		renderBullets(canvas, state.bullets, width, height)
		renderPlayer(canvas, state.player.x, height - 2, width, height)

		return canvas.map((row, y) => ({
			rowIndex: y,
			segments: parseRow(row, y),
		}))
	})
	//#endregion Computed
}
//#endregion GameCanvasComponent
