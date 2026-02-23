import { Component, ChangeDetectionStrategy, inject } from '@angular/core'
import { BoxComponent, TextComponent, injectInput } from '@wolfie/angular'
import { InvadersService } from '../services/invaders.service'
import { BRAND } from '../theme'

//#region HelpComponent
@Component({
	selector: 'app-help',
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
				padding: 2,
			}"
		>
			<w-text [style]="{ color: brand.primary }" className="font-bold text-lg"
				>📖 HELP</w-text
			>
			<w-text> </w-text>

			<w-box [style]="{ flexDirection: 'row', gap: 4 }">
				<w-box [style]="{ flexDirection: 'column' }">
					<w-text className="text-yellow font-bold">Controls</w-text>
					<w-text
						>● <w-text className="text-cyan">←/→</w-text> Move ship</w-text
					>
					<w-text>● <w-text className="text-cyan">Space</w-text> Fire</w-text>
					<w-text>● <w-text className="text-cyan">P</w-text> Pause</w-text>
					<w-text>● <w-text className="text-cyan">Q/Esc</w-text> Quit</w-text>
				</w-box>

				<w-box [style]="{ flexDirection: 'column' }">
					<w-text className="text-yellow font-bold">Scoring</w-text>
					<w-text
						>● <w-text className="text-red">^</w-text> Top alien = 30
						pts</w-text
					>
					<w-text
						>● <w-text className="text-yellow">N</w-text> Mid alien = 20
						pts</w-text
					>
					<w-text
						>● <w-text className="text-green">Y</w-text> Bot alien = 10
						pts</w-text
					>
					<w-text>● Wave clear = +100 pts</w-text>
				</w-box>
			</w-box>

			<w-text> </w-text>
			<w-box [style]="{ flexDirection: 'column', alignItems: 'center' }">
				<w-text className="text-yellow font-bold">Tips</w-text>
				<w-text className="text-gray"
					>• Destroy aliens before they reach bottom</w-text
				>
				<w-text className="text-gray"
					>• Shields absorb bullets but degrade</w-text
				>
				<w-text className="text-gray"
					>• Aliens speed up as you kill them</w-text
				>
			</w-box>

			<w-text> </w-text>
			<w-text className="text-gray">Esc Return to menu</w-text>
		</w-box>
	`,
})
export class HelpComponent {
	readonly brand = BRAND
	private readonly invaders = inject(InvadersService)

	constructor() {
		injectInput(
			(input, key) => {
				if (key.escape || input === 'q') {
					this.invaders.navigate('menu')
				}
			},
			{ isActive: () => this.invaders.screen() === 'help' }
		)
	}
}
//#endregion HelpComponent
