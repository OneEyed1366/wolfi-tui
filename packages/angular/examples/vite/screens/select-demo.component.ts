import { Component, signal, computed } from '@angular/core'
import {
	BoxComponent,
	TextComponent,
	injectInput,
	type Key,
} from '@wolfie/angular'

interface SelectOption {
	id: string
	label: string
}

@Component({
	selector: 'app-select-demo',
	standalone: true,
	imports: [BoxComponent, TextComponent],
	template: `
		<w-box class="flex-col gap-1 w-full">
			<!-- Title -->
			<w-text class="font-bold text-white">Select Demo</w-text>

			<!-- Options list -->
			<w-box class="flex-col border-single p-1">
				@for (option of options; track option.id; let i = $index) {
					<w-text [className]="getOptionClass(i)">
						{{ i === highlightedIndex() ? '>' : ' ' }} {{ option.label }}
						{{ option.id === selectedId() ? '(selected)' : '' }}
					</w-text>
				}
			</w-box>

			<!-- Selected value display -->
			<w-box class="mt-1">
				<w-text class="text-white">
					Selected: {{ selectedLabel() || 'None' }}
				</w-text>
			</w-box>

			<!-- Help text -->
			<w-box class="mt-1">
				<w-text class="text-gray">↑/↓ navigate | Enter select</w-text>
			</w-box>
		</w-box>
	`,
})
export class SelectDemoComponent {
	options: SelectOption[] = [
		{ id: 'red', label: 'Red' },
		{ id: 'green', label: 'Green' },
		{ id: 'blue', label: 'Blue' },
		{ id: 'yellow', label: 'Yellow' },
		{ id: 'cyan', label: 'Cyan' },
	]

	highlightedIndex = signal(0)
	selectedId = signal<string | null>(null)

	selectedLabel = computed(() => {
		const id = this.selectedId()
		if (!id) return null
		return this.options.find((o) => o.id === id)?.label ?? null
	})

	constructor() {
		injectInput((_input: string, key: Key) => {
			if (key.upArrow) {
				this.highlightedIndex.update((i) =>
					i > 0 ? i - 1 : this.options.length - 1
				)
			}

			if (key.downArrow) {
				this.highlightedIndex.update((i) =>
					i < this.options.length - 1 ? i + 1 : 0
				)
			}

			if (key.return) {
				const option = this.options[this.highlightedIndex()]
				if (option) {
					this.selectedId.set(option.id)
				}
			}
		})
	}

	getOptionClass(index: number): string {
		return index === this.highlightedIndex() ? 'text-cyan' : 'text-gray'
	}
}
