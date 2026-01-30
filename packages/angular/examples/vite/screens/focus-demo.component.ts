import type { OnDestroy } from '@angular/core'
import {
	Component,
	signal,
	computed,
	effect,
	inject,
	ChangeDetectionStrategy,
} from '@angular/core'
import {
	BoxComponent,
	TextComponent,
	FocusService,
	injectInput,
	type Key,
} from '@wolfie/angular'

//#region Types
interface FocusItem {
	id: string
	label: string
	color: string
}
//#endregion Types

//#region FocusDemoComponent
@Component({
	selector: 'app-focus-demo',
	standalone: true,
	imports: [BoxComponent, TextComponent],
	providers: [FocusService],
	changeDetection: ChangeDetectionStrategy.OnPush,
	template: `
		<w-box class="flex-col gap-1 w-full">
			<w-text class="text-gray">Tab/Shift+Tab to navigate between items</w-text>

			<!-- Focusable Items -->
			<w-box class="flex-col gap-1">
				@for (item of items; track item.id) {
					<w-box [className]="getItemBoxClass(item)">
						<w-text [className]="getItemTextClass(item)">
							{{ getItemPrefix(item) }}{{ item.label }}{{ getItemSuffix(item) }}
						</w-text>
					</w-box>
				}
			</w-box>

			<!-- Focus Controls -->
			<w-box class="border-single border-gray p-1 mt-1 flex-col">
				<w-text class="font-bold text-cyan">Focus Controls:</w-text>
				<w-text class="text-gray">Press 1-4 to focus item directly</w-text>
				<w-text class="text-gray">Press 'd' to disable/enable item 2</w-text>
				<w-text class="text-gray mt-1">
					Item 2 active: {{ item2Active() ? 'Yes' : 'No' }}
				</w-text>
			</w-box>
		</w-box>
	`,
})
export class FocusDemoComponent implements OnDestroy {
	//#region Constants
	readonly items: FocusItem[] = [
		{ id: 'item-1', label: 'First Item', color: 'red' },
		{ id: 'item-2', label: 'Second Item', color: 'green' },
		{ id: 'item-3', label: 'Third Item', color: 'blue' },
		{ id: 'item-4', label: 'Fourth Item', color: 'yellow' },
	]
	//#endregion Constants

	//#region Injected Dependencies
	private focusService = inject(FocusService)
	//#endregion Injected Dependencies

	//#region State
	item2Active = signal(true)
	//#endregion State

	//#region Computed
	private focusedId = computed(() => this.focusService.activeId())
	//#endregion Computed

	constructor() {
		// Register all focusable items
		this.items.forEach((item, index) => {
			this.focusService.addFocusable(item.id, {
				autoFocus: index === 0,
			})
		})

		// Handle item2 active state changes
		effect(() => {
			const isActive = this.item2Active()
			if (isActive) {
				this.focusService.activateFocusable('item-2')
			} else {
				this.focusService.deactivateFocusable('item-2')
			}
		})

		// Input handling
		injectInput((input: string, key: Key) => {
			// Tab/Shift+Tab navigation
			if (key.tab && !key.shift) {
				this.focusService.focusNext()
			}
			if (key.tab && key.shift) {
				this.focusService.focusPrevious()
			}

			// Number keys 1-4 to jump directly
			const num = parseInt(input)
			if (num >= 1 && num <= 4) {
				this.focusService.focus(`item-${num}`)
			}

			// 'd' to toggle item 2 active state
			if (input === 'd') {
				this.item2Active.update((v) => !v)
			}
		})
	}

	ngOnDestroy(): void {
		// Remove all focusables on destroy
		this.items.forEach((item) => {
			this.focusService.removeFocusable(item.id)
		})
	}

	//#region Template Methods
	isFocused(item: FocusItem): boolean {
		return this.focusedId() === item.id
	}

	isActive(item: FocusItem): boolean {
		if (item.id === 'item-2') return this.item2Active()
		return true
	}

	getItemBoxClass(item: FocusItem): string {
		const focused = this.isFocused(item)
		const active = this.isActive(item)

		const classes = [
			'p-1',
			focused ? 'border-double' : 'border-single',
			focused ? `border-${item.color}` : 'border-gray',
		]

		if (!active) {
			classes.push('opacity-50')
		}

		return classes.filter(Boolean).join(' ')
	}

	getItemTextClass(item: FocusItem): string {
		const focused = this.isFocused(item)
		const active = this.isActive(item)

		if (focused) {
			return `text-${item.color} font-bold`
		}
		return active ? 'text-white' : 'text-gray'
	}

	getItemPrefix(item: FocusItem): string {
		return this.isFocused(item) ? '> ' : '  '
	}

	getItemSuffix(item: FocusItem): string {
		const parts: string[] = []

		if (this.isFocused(item)) {
			parts.push(' (focused)')
		}
		if (!this.isActive(item)) {
			parts.push(' (disabled)')
		}

		return parts.join('')
	}
	//#endregion Template Methods
}
//#endregion FocusDemoComponent
