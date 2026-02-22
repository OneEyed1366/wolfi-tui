import { Component, signal, computed } from '@angular/core'
import {
	BoxComponent,
	TextComponent,
	SelectComponent,
	MultiSelectComponent,
	type Option,
} from '@wolfie/angular'

//#region SelectDemoComponent
@Component({
	selector: 'app-select-demo',
	standalone: true,
	imports: [BoxComponent, TextComponent, SelectComponent, MultiSelectComponent],
	template: `
		<w-box class="flex-col gap-1 w-full">
			<!-- Single Select -->
			<w-text [className]="singleSelectTitleClass()">
				Single Select {{ focusedList() === 'color' ? '(active)' : '' }}
			</w-text>
			<w-text class="text-gray">
				Arrows navigate, Enter selects (auto-advances to next)
			</w-text>
			<w-select
				[options]="colorOptions"
				[visibleOptionCount]="4"
				[isDisabled]="focusedList() !== 'color'"
				(selectChange)="onColorChange($event)"
			/>

			<!-- Multi Select -->
			<w-text [className]="multiSelectTitleClass()" class="mt-1">
				Multi Select {{ focusedList() === 'features' ? '(active)' : '' }}
			</w-text>
			<w-text class="text-gray">Space toggles, Enter confirms</w-text>
			<w-multi-select
				[options]="featureOptions"
				[visibleOptionCount]="4"
				[isDisabled]="focusedList() !== 'features'"
				(selectionChange)="onFeaturesChange($event)"
				(submitSelection)="onFeaturesSubmit($event)"
			/>

			<!-- Selected Values -->
			<w-box class="border-single border-gray p-1 mt-1 flex-col">
				<w-text class="font-bold text-cyan">Selected Values:</w-text>
				<w-text>Color: {{ selectedColorDisplay() }}</w-text>
				<w-text>Features: {{ selectedFeaturesDisplay() }}</w-text>
			</w-box>
		</w-box>
	`,
})
export class SelectDemoComponent {
	//#region Options
	readonly colorOptions: Option[] = [
		{ label: 'Red', value: 'red' },
		{ label: 'Green', value: 'green' },
		{ label: 'Blue', value: 'blue' },
		{ label: 'Yellow', value: 'yellow' },
		{ label: 'Purple', value: 'purple' },
	]

	readonly featureOptions: Option[] = [
		{ label: 'TypeScript Support', value: 'typescript' },
		{ label: 'Hot Reload', value: 'hot-reload' },
		{ label: 'CSS Modules', value: 'css-modules' },
		{ label: 'Tailwind CSS', value: 'tailwind' },
		{ label: 'SSR Support', value: 'ssr' },
	]
	//#endregion Options

	//#region State
	readonly selectedColor = signal<string>('')
	readonly selectedFeatures = signal<string[]>([])
	readonly focusedList = signal<'color' | 'features'>('color')
	//#endregion State

	//#region Computed
	readonly singleSelectTitleClass = computed(() =>
		this.focusedList() === 'color'
			? 'font-bold text-cyan'
			: 'font-bold text-white'
	)

	readonly multiSelectTitleClass = computed(() =>
		this.focusedList() === 'features'
			? 'font-bold text-cyan'
			: 'font-bold text-white'
	)

	readonly selectedColorDisplay = computed(
		() => this.selectedColor() || '(none)'
	)

	readonly selectedFeaturesDisplay = computed(() => {
		const features = this.selectedFeatures()
		return features.length > 0 ? features.join(', ') : '(none)'
	})
	//#endregion Computed

	//#region Event Handlers
	onColorChange(value: string): void {
		this.selectedColor.set(value)
		this.focusedList.set('features')
	}

	onFeaturesChange(values: string[]): void {
		this.selectedFeatures.set(values)
	}

	onFeaturesSubmit(_values: string[]): void {
		// Handle submit if needed - could navigate to next screen, etc.
	}
	//#endregion Event Handlers
}
//#endregion SelectDemoComponent
