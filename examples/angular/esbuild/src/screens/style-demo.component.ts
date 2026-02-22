import { Component } from '@angular/core'
import { BoxComponent, TextComponent } from '@wolfie/angular'

// Import CSS Modules
import buttonStyles from '../styles/Button.module.css'
import cardStyles from '../styles/Card.module.css'

@Component({
	selector: 'app-style-demo',
	standalone: true,
	imports: [BoxComponent, TextComponent],
	template: `
		<w-box class="flex-col w-full">
			<!-- Tailwind Section -->
			<w-box class="border-double border-yellow p-1 mb-1 flex-col w-full">
				<w-text class="text-[cyan]">
					Tailwind: border-double + arbitrary text-[cyan]
				</w-text>
			</w-box>

			<!-- SCSS Section -->
			<w-box class="card flex-col mb-1 w-full">
				<w-text class="card-title">SCSS Flavor</w-text>
				<w-text class="text-muted"
					>Nested selectors from components.scss</w-text
				>
			</w-box>

			<!-- LESS Section -->
			<w-box class="less-box flex-col mb-1 w-full">
				<w-text class="less-text">LESS Flavor</w-text>
				<w-text class="text-muted">Nesting from styles.less</w-text>
			</w-box>

			<!-- Stylus Section -->
			<w-box class="stylus-box flex-col mb-1 w-full">
				<w-text class="stylus-text">Stylus Flavor</w-text>
				<w-text class="text-muted">Indentation-based styles.styl</w-text>
			</w-box>

			<!-- CSS Modules Section -->
			<w-box [className]="[cardModuleClass, 'flex-col mb-1 w-full']">
				<w-text [className]="cardTitleClass">CSS Modules Flavor</w-text>
				<w-text class="text-muted">Scoped styles from Card.module.css</w-text>
			</w-box>

			<!-- Buttons Mix -->
			<w-box class="flex-row gap-2 w-full">
				<w-box class="btn primary">
					<w-text>SCSS Btn</w-text>
				</w-box>
				<w-box [className]="buttonClass">
					<w-text [className]="buttonTextClass">Module Btn</w-text>
				</w-box>
				<w-box class="bg-blue-600 p-x-2">
					<w-text class="text-white">Tailwind Btn</w-text>
				</w-box>
			</w-box>
		</w-box>
	`,
})
export class StyleDemoComponent {
	// CSS Module class names
	buttonClass = buttonStyles.button
	buttonTextClass = buttonStyles.text
	cardModuleClass = cardStyles.card
	cardTitleClass = cardStyles['card-title']
}
