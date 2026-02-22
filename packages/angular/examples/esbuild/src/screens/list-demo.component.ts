import { Component } from '@angular/core'
import {
	BoxComponent,
	TextComponent,
	OrderedListComponent,
	OrderedListItemComponent,
	UnorderedListComponent,
	UnorderedListItemComponent,
} from '@wolfie/angular'

@Component({
	selector: 'app-list-demo',
	standalone: true,
	imports: [
		BoxComponent,
		TextComponent,
		OrderedListComponent,
		OrderedListItemComponent,
		UnorderedListComponent,
		UnorderedListItemComponent,
	],
	template: `
		<w-box class="flex-col gap-1 w-full">
			<!-- Ordered List -->
			<w-text class="font-bold text-white">Ordered List</w-text>
			<w-ordered-list>
				<w-ordered-list-item [index]="1" [maxWidth]="1">
					<w-text>Install dependencies with pnpm</w-text>
				</w-ordered-list-item>
				<w-ordered-list-item [index]="2" [maxWidth]="1">
					<w-text>Configure your environment</w-text>
				</w-ordered-list-item>
				<w-ordered-list-item [index]="3" [maxWidth]="1">
					<w-text>Run the development server</w-text>
				</w-ordered-list-item>
				<w-ordered-list-item [index]="4" [maxWidth]="1">
					<w-text>Build for production</w-text>
				</w-ordered-list-item>
			</w-ordered-list>

			<!-- Unordered List -->
			<w-text class="font-bold text-white mt-1">Unordered List</w-text>
			<w-unordered-list>
				<w-unordered-list-item>
					<w-text>Supports Vue 3 Composition API</w-text>
				</w-unordered-list-item>
				<w-unordered-list-item>
					<w-text>Full TypeScript support</w-text>
				</w-unordered-list-item>
				<w-unordered-list-item>
					<w-text>CSS preprocessing (SCSS, LESS, Stylus)</w-text>
				</w-unordered-list-item>
				<w-unordered-list-item>
					<w-text>Tailwind CSS integration</w-text>
				</w-unordered-list-item>
			</w-unordered-list>

			<!-- Nested Lists -->
			<w-text class="font-bold text-white mt-1">Nested Lists</w-text>
			<w-ordered-list>
				<w-ordered-list-item [index]="1" [maxWidth]="1">
					<w-text>Frontend</w-text>
				</w-ordered-list-item>
				<w-unordered-list>
					<w-unordered-list-item>
						<w-text>Vue components</w-text>
					</w-unordered-list-item>
					<w-unordered-list-item>
						<w-text>Composables</w-text>
					</w-unordered-list-item>
				</w-unordered-list>
				<w-ordered-list-item [index]="2" [maxWidth]="1">
					<w-text>Backend</w-text>
				</w-ordered-list-item>
				<w-unordered-list>
					<w-unordered-list-item>
						<w-text>API routes</w-text>
					</w-unordered-list-item>
					<w-unordered-list-item>
						<w-text>Database models</w-text>
					</w-unordered-list-item>
				</w-unordered-list>
			</w-ordered-list>
		</w-box>
	`,
})
export class ListDemoComponent {}
