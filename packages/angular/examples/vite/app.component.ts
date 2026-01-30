import { Component, signal, inject } from '@angular/core'
import {
	BoxComponent,
	TextComponent,
	injectInput,
	AppService,
	type Key,
} from '@wolfie/angular'

// Import styles (side-effect imports for global styles)
import './styles/tailwind.css'
import './styles/global.css'
import './styles/components.scss'
import './styles/styles.less'
import './styles/styles.styl'

// Import CSS Modules
import buttonStyles from './styles/Button.module.css'
import cardStyles from './styles/Card.module.css'

// Screen imports
import { StyleDemoComponent } from './screens/style-demo.component'
import { InputDemoComponent } from './screens/input-demo.component'
import { SelectDemoComponent } from './screens/select-demo.component'
import { StatusDemoComponent } from './screens/status-demo.component'
import { ListDemoComponent } from './screens/list-demo.component'
import { ErrorDemoComponent } from './screens/error-demo.component'

interface Screen {
	name: string
	id: string
}

@Component({
	selector: 'app-root',
	standalone: true,
	imports: [
		BoxComponent,
		TextComponent,
		StyleDemoComponent,
		InputDemoComponent,
		SelectDemoComponent,
		StatusDemoComponent,
		ListDemoComponent,
		ErrorDemoComponent,
	],
	template: `
		<w-box class="flex-col p-1 w-full">
			<!-- Header -->
			<w-box class="mb-1">
				<w-text class="text-[blue] font-bold">Wolfie Angular Demo</w-text>
			</w-box>

			<!-- Screen tabs -->
			<w-box class="flex-row gap-2 mb-1">
				@for (screen of screens; track screen.id; let i = $index) {
					<w-text
						[className]="
							i === activeScreen() ? 'text-[cyan] font-bold' : 'text-[gray]'
						"
					>
						[{{ i + 1 }}] {{ screen.name }}
					</w-text>
				}
			</w-box>

			<!-- Active screen -->
			@switch (activeScreen()) {
				@case (0) {
					<app-style-demo />
				}
				@case (1) {
					<app-input-demo />
				}
				@case (2) {
					<app-select-demo />
				}
				@case (3) {
					<app-status-demo />
				}
				@case (4) {
					<app-list-demo />
				}
				@case (5) {
					<app-error-demo />
				}
			}

			<!-- Footer -->
			<w-box class="mt-1 border-t border-[gray] pt-1">
				<w-text class="text-[gray]">tab navigate | 1-6 jump | q quit</w-text>
			</w-box>
		</w-box>
	`,
})
export class AppComponent {
	screens: Screen[] = [
		{ name: 'Styles', id: 'styles' },
		{ name: 'Inputs', id: 'inputs' },
		{ name: 'Select', id: 'select' },
		{ name: 'Status', id: 'status' },
		{ name: 'Lists', id: 'lists' },
		{ name: 'Errors', id: 'errors' },
	]

	activeScreen = signal(0)
	private appService = inject(AppService)

	constructor() {
		injectInput((input: string, key: Key) => {
			if (input === 'q') {
				this.appService.exit()
			}

			// Tab/Shift+Tab for navigation
			if (key.tab && !key.shift) {
				this.activeScreen.update((v) => (v + 1) % this.screens.length)
			}
			if (key.tab && key.shift) {
				this.activeScreen.update(
					(v) => (v - 1 + this.screens.length) % this.screens.length
				)
			}

			// Number keys 1-6 to jump to screen
			const num = parseInt(input)
			if (num >= 1 && num <= this.screens.length) {
				this.activeScreen.set(num - 1)
			}
		})
	}
}

// Export CSS module styles for use in child components
export { buttonStyles, cardStyles }
