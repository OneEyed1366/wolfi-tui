import {
	Component,
	ChangeDetectionStrategy,
	inject,
	computed,
} from '@angular/core'
import { BoxComponent, TextComponent, SpacerComponent } from '@wolfie/angular'
import { InvadersService } from '../services/invaders.service'
import { BRAND } from '../theme'

//#region HudComponent
@Component({
	selector: 'app-hud',
	standalone: true,
	imports: [BoxComponent, TextComponent, SpacerComponent],
	changeDetection: ChangeDetectionStrategy.OnPush,
	template: `
		<w-box [style]="{ flexDirection: 'row', width: '100%' }">
			<w-box>
				<w-text [style]="{ color: brand.primary, fontWeight: 'bold' }"
					>SCORE
				</w-text>
				<w-text
					[style]="{
						color: brand.bgDark,
						backgroundColor: brand.primary,
						fontWeight: 'bold',
					}"
					>{{ ' ' + formattedScore() + ' ' }}</w-text
				>
			</w-box>

			<w-spacer />

			<w-box>
				<w-text [style]="{ color: brand.error, fontWeight: 'bold' }"
					>LIVES
				</w-text>
				<w-text [style]="{ color: brand.error }">{{ livesHearts() }}</w-text>
			</w-box>

			<w-spacer />

			<w-box>
				<w-text [style]="{ color: brand.primary, fontWeight: 'bold' }"
					>WAVE
				</w-text>
				<w-text
					[style]="{
						color: brand.bgDark,
						backgroundColor: brand.primaryDark,
						fontWeight: 'bold',
					}"
					>{{ ' ' + wave() + ' ' }}</w-text
				>
			</w-box>

			@if (showFps()) {
				<w-spacer />
				<w-box>
					<w-text [style]="{ color: brand.textMuted }">FPS </w-text>
					<w-text [style]="{ color: brand.success }">{{ fps() }}</w-text>
				</w-box>
			}
		</w-box>
	`,
})
export class HudComponent {
	//#region DI
	private readonly invaders = inject(InvadersService)
	//#endregion DI

	//#region Constants
	readonly brand = BRAND
	//#endregion Constants

	//#region Computed
	readonly score = computed(() => this.invaders.state().score)
	readonly wave = computed(() => this.invaders.state().wave)
	readonly lives = computed(() => this.invaders.state().lives)
	readonly showFps = computed(() => this.invaders.state().settings.showFps)
	readonly fps = computed(() => 0) // FPS tracked by game component

	formattedScore = computed(() => this.score().toString().padStart(6, '0'))
	livesHearts = computed(() =>
		Array.from({ length: this.lives() }, () => '\u2665').join(' ')
	)
	//#endregion Computed
}
//#endregion HudComponent
