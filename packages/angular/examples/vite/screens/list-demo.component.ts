import { Component } from '@angular/core'
import { BoxComponent, TextComponent } from '@wolfie/angular'

@Component({
	selector: 'app-list-demo',
	standalone: true,
	imports: [BoxComponent, TextComponent],
	template: `
		<w-box class="flex-col w-full">
			<!-- Title -->
			<w-text class="font-bold text-white">List Demo</w-text>

			<!-- Ordered List -->
			<w-box class="flex-col gap-1 mt-1">
				<w-text class="text-gray">Ordered List:</w-text>
				<w-box class="flex-col p-l-2">
					<w-text>1. Install dependencies</w-text>
					<w-text>2. Configure environment</w-text>
					<w-text>3. Run build command</w-text>
					<w-text>4. Deploy to production</w-text>
				</w-box>
			</w-box>

			<!-- Unordered List -->
			<w-box class="flex-col gap-1 mt-1">
				<w-text class="text-gray">Unordered List:</w-text>
				<w-box class="flex-col p-l-2">
					<w-text>• TypeScript support</w-text>
					<w-text>• Hot module reload</w-text>
					<w-text>• Tailwind integration</w-text>
					<w-text>• CSS Modules</w-text>
				</w-box>
			</w-box>

			<!-- Nested List -->
			<w-box class="flex-col gap-1 mt-1">
				<w-text class="text-gray">Nested List:</w-text>
				<w-box class="flex-col p-l-2">
					<w-text>1. Frontend</w-text>
					<w-box class="flex-col p-l-2">
						<w-text>• Angular</w-text>
						<w-text>• Vue</w-text>
						<w-text>• React</w-text>
					</w-box>
					<w-text>2. Backend</w-text>
					<w-box class="flex-col p-l-2">
						<w-text>• Node.js</w-text>
						<w-text>• Python</w-text>
					</w-box>
					<w-text>3. Database</w-text>
					<w-box class="flex-col p-l-2">
						<w-text>• PostgreSQL</w-text>
						<w-text>• MongoDB</w-text>
					</w-box>
				</w-box>
			</w-box>
		</w-box>
	`,
})
export class ListDemoComponent {}
