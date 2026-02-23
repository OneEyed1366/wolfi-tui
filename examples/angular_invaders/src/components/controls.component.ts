import { Component, ChangeDetectionStrategy } from '@angular/core'
import { BoxComponent, TextComponent } from '@wolfie/angular'
import { BRAND } from '../theme'

//#region Constants
const MIN_CONTROLS_WIDTH = 25
const NBSP = '\u00A0'
//#endregion Constants

//#region ControlsComponent
@Component({
	selector: 'app-controls',
	standalone: true,
	imports: [BoxComponent, TextComponent],
	changeDetection: ChangeDetectionStrategy.OnPush,
	template: `
		<w-box [style]="{ flexDirection: 'column', minWidth: minWidth }">
			<w-text [style]="{ color: brand.primary }" className="font-bold"
				>🎮 Controls</w-text
			>
			<w-text>
				<w-text [style]="{ color: brand.primary }">{{ leftRight }}</w-text>
				<w-text [style]="{ color: brand.textMuted }">{{ nbsp }}Move </w-text>
				<w-text [style]="{ color: brand.primary }">Space</w-text>
				<w-text [style]="{ color: brand.textMuted }">{{ nbsp }}Shoot</w-text>
			</w-text>
			<w-text>
				<w-text [style]="{ color: brand.primary }">P</w-text>
				<w-text [style]="{ color: brand.textMuted }">{{ nbsp }}Pause </w-text>
				<w-text [style]="{ color: brand.primary }">Q</w-text>
				<w-text [style]="{ color: brand.textMuted }">{{ nbsp }}Quit</w-text>
			</w-text>
		</w-box>
	`,
})
export class ControlsComponent {
	readonly brand = BRAND
	readonly minWidth = MIN_CONTROLS_WIDTH
	readonly nbsp = NBSP
	readonly leftRight = '\u2190/\u2192'
}
//#endregion ControlsComponent
