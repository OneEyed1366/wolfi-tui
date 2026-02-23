import {
	Component,
	ChangeDetectionStrategy,
	inject,
	computed,
} from '@angular/core'
import { BoxComponent, TextComponent } from '@wolfie/angular'
import { InvadersService } from '../services/invaders.service'
import { BRAND } from '../theme'

//#region Alien Display Config
const ALIEN_CONFIG = [
	{ name: 'Top', color: '#ef4444', points: 30 },
	{ name: 'Mid', color: '#eab308', points: 20 },
	{ name: 'Bot', color: '#22c55e', points: 10 },
] as const

const MAX_VISIBLE_KILLS = 3
//#endregion Alien Display Config

//#region Helpers
function getAlienConfig(type: number) {
	return (
		ALIEN_CONFIG[type] ?? { name: 'Unknown', color: 'text-white', points: 0 }
	)
}
//#endregion Helpers

//#region KillLogComponent
@Component({
	selector: 'app-kill-log',
	standalone: true,
	imports: [BoxComponent, TextComponent],
	changeDetection: ChangeDetectionStrategy.OnPush,
	template: `
		<w-box [style]="{ flexDirection: 'column', minWidth: 20 }">
			<w-text [style]="{ color: brand.primary }" className="font-bold"
				>⚔ Recent Kills</w-text
			>

			@if (visibleKills().length === 0) {
				<w-text [style]="{ color: brand.textMuted }" className="italic">
					Start shooting!</w-text
				>
			} @else {
				@for (kill of visibleKills(); track kill.id) {
					<w-text [style]="{ color: getAlienConfig(kill.alien.type).color }"
						>{{ getAlienConfig(kill.alien.type).name }} +{{
							kill.points
						}}</w-text
					>
				}
			}

			@if (emptySlots() > 0 && visibleKills().length > 0) {
				@for (_ of emptySlotArray(); track $index) {
					<w-text> </w-text>
				}
			}
		</w-box>
	`,
})
export class KillLogComponent {
	//#region DI
	private readonly invaders = inject(InvadersService)
	//#endregion DI

	//#region Constants
	readonly brand = BRAND
	readonly getAlienConfig = getAlienConfig
	//#endregion Constants

	//#region Computed
	readonly kills = computed(() => this.invaders.state().kills.slice(-10))
	visibleKills = computed(() => this.kills().slice(-MAX_VISIBLE_KILLS))
	emptySlots = computed(() => MAX_VISIBLE_KILLS - this.visibleKills().length)
	emptySlotArray = computed(() => Array.from({ length: this.emptySlots() }))
	//#endregion Computed
}
//#endregion KillLogComponent
