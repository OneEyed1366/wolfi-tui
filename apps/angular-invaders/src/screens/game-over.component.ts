import {
	Component,
	ChangeDetectionStrategy,
	inject,
	computed,
} from '@angular/core'
import { BoxComponent, TextComponent, injectInput } from '@wolfie/angular'
import { InvadersService } from '../services/invaders.service'
import { BRAND } from '../theme'

//#region ASCII Art
const GAME_OVER_ASCII = `
  ____    _    __  __ _____    _____     _______ ____
 / ___|  / \\  |  \\/  | ____|  / _ \\ \\   / / ____|  _ \\
| |  _  / _ \\ | |\\/| |  _|   | | | \\ \\ / /|  _| | |_) |
| |_| |/ ___ \\| |  | | |___  | |_| |\\ V / | |___|  _ <
 \\____/_/   \\_\\_|  |_|_____|  \\___/  \\_/  |_____|_| \\_\\
`
//#endregion ASCII Art

//#region GameOverComponent
@Component({
	selector: 'app-game-over',
	standalone: true,
	imports: [BoxComponent, TextComponent],
	changeDetection: ChangeDetectionStrategy.OnPush,
	template: `
		<w-box
			[style]="{
				width: '100vw',
				height: '100vh',
				flexDirection: 'column',
				alignItems: 'center',
				justifyContent: 'center',
				backgroundColor: brand.bgDark,
			}"
		>
			<w-text [style]="{ color: brand.error, fontWeight: 'bold' }">{{
				gameOverAscii
			}}</w-text>

			<w-box
				[style]="{
					marginTop: 2,
					flexDirection: 'column',
					alignItems: 'center',
				}"
			>
				<w-text [style]="{ color: brand.primary }" className="font-bold text-lg"
					>SCORE: {{ formattedScore() }}</w-text
				>
				<w-text [style]="{ color: brand.primaryDark }"
					>Wave {{ invaders.state().wave }}</w-text
				>
			</w-box>

			<w-box
				[style]="{
					marginTop: 3,
					flexDirection: 'column',
					alignItems: 'center',
				}"
			>
				<w-text [style]="{ color: brand.primary, fontWeight: 'bold' }"
					>[R] Retry</w-text
				>
				<w-text [style]="{ color: brand.textMuted }"
					>[H] High Scores • [Q] Menu</w-text
				>
			</w-box>
		</w-box>
	`,
})
export class GameOverComponent {
	readonly brand = BRAND
	readonly gameOverAscii = GAME_OVER_ASCII
	readonly invaders = inject(InvadersService)

	readonly formattedScore = computed(() =>
		this.invaders.state().score.toString().padStart(6, '0')
	)

	constructor() {
		injectInput(
			(input, key) => {
				if (key.return || input === 'r') {
					this.invaders.restart()
				} else if (input === 'h') {
					this.invaders.navigate('highscores')
				} else if (key.escape || input === 'q') {
					this.invaders.navigate('menu')
				}
			},
			{ isActive: () => this.invaders.screen() === 'gameover' }
		)
	}
}
//#endregion GameOverComponent
