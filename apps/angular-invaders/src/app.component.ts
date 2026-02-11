import {
	Component,
	ChangeDetectionStrategy,
	inject,
	signal,
	DestroyRef,
} from '@angular/core'
import {
	BoxComponent,
	TextComponent,
	StdoutService,
	THEME_CONTEXT,
} from '@wolfie/angular'
import { InvadersService } from './services/invaders.service'
import { invadersTheme } from './theme'
import { MenuComponent } from './screens/menu.component'
import { GameComponent } from './screens/game.component'
import { GameOverComponent } from './screens/game-over.component'
import { HelpComponent } from './screens/help.component'
import { HighScoresComponent } from './screens/high-scores.component'
import { SettingsComponent } from './screens/settings.component'

@Component({
	selector: 'app-root',
	standalone: true,
	imports: [
		BoxComponent,
		TextComponent,
		MenuComponent,
		GameComponent,
		GameOverComponent,
		HelpComponent,
		HighScoresComponent,
		SettingsComponent,
	],
	providers: [
		InvadersService,
		{ provide: THEME_CONTEXT, useValue: invadersTheme },
	],
	changeDetection: ChangeDetectionStrategy.OnPush,
	template: `
		<w-box [style]="{ flexDirection: 'column', width: '100%', height: '100%' }">
			@switch (invaders.screen()) {
				@case ('menu') {
					<app-menu />
				}
				@case ('game') {
					<app-game />
				}
				@case ('gameover') {
					<app-game-over />
				}
				@case ('help') {
					<app-help />
				}
				@case ('highscores') {
					<app-high-scores />
				}
				@case ('settings') {
					<app-settings />
				}
			}
		</w-box>
	`,
})
export class AppComponent {
	readonly invaders = inject(InvadersService)
	private readonly stdout = inject(StdoutService)
	private readonly destroyRef = inject(DestroyRef)

	readonly termSize = signal({
		width: this.stdout.stdout.columns ?? 80,
		height: this.stdout.stdout.rows ?? 24,
	})

	constructor() {
		const onResize = () => {
			const width = this.stdout.stdout.columns ?? 80
			const height = this.stdout.stdout.rows ?? 24
			this.termSize.set({ width, height })
			this.invaders.resize(width, height)
		}

		this.stdout.stdout.on('resize', onResize)
		this.destroyRef.onDestroy(() => {
			this.stdout.stdout.off('resize', onResize)
		})

		// Initial resize
		this.invaders.resize(this.termSize().width, this.termSize().height)
	}
}
