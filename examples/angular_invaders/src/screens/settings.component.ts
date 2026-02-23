import {
	Component,
	ChangeDetectionStrategy,
	inject,
	signal,
	computed,
} from '@angular/core'
import {
	BoxComponent,
	TextComponent,
	SelectComponent,
	MultiSelectComponent,
	injectInput,
} from '@wolfie/angular'
import { InvadersService } from '../services/invaders.service'
import { BRAND } from '../theme'
import type { Difficulty } from '../game/types'

//#region Options
const DIFFICULTY_OPTIONS = [
	{ label: 'Easy - Slower aliens', value: 'easy' },
	{ label: 'Normal - Standard', value: 'normal' },
	{ label: 'Hard - Fast aliens', value: 'hard' },
]

const TOGGLE_OPTIONS = [
	{ label: 'Show FPS Counter', value: 'showFps' },
	{ label: 'Shield Health Bars', value: 'shieldBars' },
	{ label: 'Kill Log', value: 'killLog' },
	{ label: 'Alien Animation', value: 'alienAnim' },
	{ label: 'Debug Mode', value: 'debug' },
]
//#endregion Options

//#region SettingsComponent
@Component({
	selector: 'app-settings',
	standalone: true,
	imports: [BoxComponent, TextComponent, SelectComponent, MultiSelectComponent],
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
				padding: 2,
			}"
		>
			<w-text [style]="{ color: brand.primary }" className="font-bold text-lg"
				>⚙ SETTINGS</w-text
			>
			<w-text> </w-text>

			<w-text
				[style]="
					activeSection() === 'difficulty'
						? { color: '#eab308', fontWeight: 'bold' }
						: { color: '#6b7280' }
				"
			>
				Difficulty:{{
					activeSection() !== 'difficulty' ? ' (Tab to switch)' : ''
				}}
			</w-text>
			<w-select
				[options]="difficultyOptions"
				[defaultValue]="currentDifficulty()"
				[visibleOptionCount]="3"
				[isDisabled]="activeSection() !== 'difficulty'"
				(selectChange)="onDifficulty($event)"
			/>

			<w-text> </w-text>
			<w-text
				[style]="
					activeSection() === 'options'
						? { color: '#eab308', fontWeight: 'bold' }
						: { color: '#6b7280' }
				"
			>
				Options:{{ activeSection() !== 'options' ? ' (Tab to switch)' : '' }}
			</w-text>
			<w-multi-select
				[options]="toggleOptions"
				[defaultValue]="currentToggles()"
				[visibleOptionCount]="5"
				[isDisabled]="activeSection() !== 'options'"
				(selectionChange)="onToggles($event)"
			/>

			<w-text> </w-text>
			<w-text className="text-gray">Tab Switch • Esc Menu</w-text>
		</w-box>
	`,
})
export class SettingsComponent {
	readonly brand = BRAND
	readonly difficultyOptions = DIFFICULTY_OPTIONS
	readonly toggleOptions = TOGGLE_OPTIONS

	private readonly invaders = inject(InvadersService)
	readonly activeSection = signal<'difficulty' | 'options'>('difficulty')

	readonly currentDifficulty = computed(
		() => this.invaders.state().settings.difficulty
	)

	readonly currentToggles = computed(() => {
		const s = this.invaders.state().settings
		const toggles: string[] = []
		if (s.showFps) toggles.push('showFps')
		if (s.shieldBars) toggles.push('shieldBars')
		if (s.killLog) toggles.push('killLog')
		if (s.alienAnim) toggles.push('alienAnim')
		if (s.debug) toggles.push('debug')
		return toggles
	})

	constructor() {
		injectInput(
			(input, key) => {
				if (key.escape || input === 'q') {
					this.invaders.navigate('menu')
					return
				}
				if (key.tab) {
					this.activeSection.update((s) =>
						s === 'difficulty' ? 'options' : 'difficulty'
					)
				}
			},
			{ isActive: () => this.invaders.screen() === 'settings' }
		)
	}

	onDifficulty(value: string) {
		if (value === this.invaders.state().settings.difficulty) return
		this.invaders.updateSettings({ difficulty: value as Difficulty })
	}

	onToggles(values: string[]) {
		this.invaders.updateSettings({
			showFps: values.includes('showFps'),
			shieldBars: values.includes('shieldBars'),
			killLog: values.includes('killLog'),
			alienAnim: values.includes('alienAnim'),
			debug: values.includes('debug'),
		})
	}
}
//#endregion SettingsComponent
