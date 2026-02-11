import { Component, ChangeDetectionStrategy, inject } from '@angular/core'
import {
	BoxComponent,
	TextComponent,
	SelectComponent,
	FocusService,
	AppService,
	injectInput,
} from '@wolfie/angular'
import { InvadersService } from '../services/invaders.service'
import { BRAND } from '../theme'

//#region Menu Options
const MENU_OPTIONS = [
	{ label: 'Start Game', value: 'start' },
	{ label: 'High Scores', value: 'highscores' },
	{ label: 'Settings', value: 'settings' },
	{ label: 'Help', value: 'help' },
	{ label: 'Quit', value: 'quit' },
]
//#endregion Menu Options

//#region ASCII Logo
const LOGO = `
 ____  ____   _    ____ _____   ___ _   ___     ___    ____  _____ ____  ____
/ ___||  _ \\ / \\  / ___| ____| |_ _| \\ | \\ \\   / / \\  |  _ \\| ____|  _ \\/ ___|
\\___ \\| |_) / _ \\| |   |  _|    | ||  \\| |\\ \\ / / _ \\ | | | |  _| | |_) \\___ \\
 ___) |  __/ ___ \\ |___| |___   | || |\\  | \\ V / ___ \\| |_| | |___|  _ < ___) |
|____/|_| /_/   \\_\\____|_____| |___|_| \\_|  \\_/_/   \\_\\____/|_____|_| \\_\\____/
`
//#endregion ASCII Logo

//#region MenuComponent
@Component({
	selector: 'app-menu',
	standalone: true,
	imports: [BoxComponent, TextComponent, SelectComponent],
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
			<w-text [style]="{ color: brand.primary, fontWeight: 'bold' }">{{
				logo
			}}</w-text>

			<w-box [style]="{ marginTop: 2, marginBottom: 1 }">
				<w-text className="text-gray">↑/↓ Navigate • Enter Select</w-text>
			</w-box>

			<w-select [options]="menuOptions" (selectChange)="onSelect($event)" />

			<w-box
				[style]="{
					position: 'absolute',
					bottom: 1,
					width: '100vw',
					justifyContent: 'center',
				}"
			>
				<w-text [style]="{ color: brand.textMuted }"
					>v1.0 • {{ brand.name }} Space Invaders</w-text
				>
			</w-box>
		</w-box>
	`,
})
export class MenuComponent {
	readonly brand = BRAND
	readonly logo = LOGO
	readonly menuOptions = MENU_OPTIONS

	private readonly invaders = inject(InvadersService)
	private readonly focusService = inject(FocusService)
	private readonly appService = inject(AppService)

	constructor() {
		injectInput(
			(input, key) => {
				if (key.tab) {
					if (key.shift) {
						this.focusService.focusPrevious()
					} else {
						this.focusService.focusNext()
					}
				}
			},
			{ isActive: () => this.invaders.screen() === 'menu' }
		)
	}

	onSelect(value: string) {
		switch (value) {
			case 'start':
				this.invaders.startGame()
				break
			case 'highscores':
				this.invaders.navigate('highscores')
				break
			case 'settings':
				this.invaders.navigate('settings')
				break
			case 'help':
				this.invaders.navigate('help')
				break
			case 'quit':
				this.appService.exit()
				break
		}
	}
}
//#endregion MenuComponent
