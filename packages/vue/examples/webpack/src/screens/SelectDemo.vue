<template>
	<Box class="flex-col gap-1 w-full">
		<!-- Single Select -->
		<Text
			:class="
				focusedList === 'color' ? 'font-bold text-cyan' : 'font-bold text-white'
			"
		>
			Single Select {{ focusedList === 'color' ? '(active)' : '' }}
		</Text>
		<Text class="text-gray"
			>Arrows navigate, Enter selects (auto-advances to next)</Text
		>
		<Select
			:options="colorOptions"
			:visible-option-count="4"
			:is-disabled="focusedList !== 'color'"
			:on-change="onColorChange"
		/>

		<!-- Multi Select -->
		<Text
			:class="
				focusedList === 'features'
					? 'font-bold text-cyan'
					: 'font-bold text-white'
			"
			class="mt-1"
		>
			Multi Select {{ focusedList === 'features' ? '(active)' : '' }}
		</Text>
		<Text class="text-gray">Space toggles, Enter confirms</Text>
		<MultiSelect
			:options="featureOptions"
			:visible-option-count="4"
			:is-disabled="focusedList !== 'features'"
			:on-change="(v: string[]) => (selectedFeatures = v)"
		/>

		<!-- Selected Values -->
		<Box class="border-single border-gray p-1 mt-1 flex-col">
			<Text class="font-bold text-cyan">Selected Values:</Text>
			<Text>Color: {{ selectedColor || '(none)' }}</Text>
			<Text
				>Features:
				{{
					selectedFeatures.length > 0 ? selectedFeatures.join(', ') : '(none)'
				}}</Text
			>
		</Box>
	</Box>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Box, Text, Select, MultiSelect } from '@wolfie/vue'

const colorOptions = [
	{ label: 'Red', value: 'red' },
	{ label: 'Green', value: 'green' },
	{ label: 'Blue', value: 'blue' },
	{ label: 'Yellow', value: 'yellow' },
	{ label: 'Purple', value: 'purple' },
]

const featureOptions = [
	{ label: 'TypeScript Support', value: 'typescript' },
	{ label: 'Hot Reload', value: 'hot-reload' },
	{ label: 'CSS Modules', value: 'css-modules' },
	{ label: 'Tailwind CSS', value: 'tailwind' },
	{ label: 'SSR Support', value: 'ssr' },
]

const selectedColor = ref('')
const selectedFeatures = ref<string[]>([])

// Focus management - only one list active at a time
const focusedList = ref<'color' | 'features'>('color')

// When color is selected, auto-advance to features list
const onColorChange = (v: string) => {
	selectedColor.value = v
	focusedList.value = 'features'
}
</script>
