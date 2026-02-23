<template>
	<Box class="flex-col gap-1 w-full">
		<Text class="text-gray">Tab/Shift+Tab to navigate between items</Text>

		<!-- Focusable Items -->
		<Box class="flex-col gap-1">
			<FocusableItem
				v-for="(item, i) in items"
				:key="item.id"
				:id="item.id"
				:label="item.label"
				:color="item.color"
				:auto-focus="i === 0"
			/>
		</Box>

		<!-- Focus Controls -->
		<Box class="border-single border-gray p-1 mt-1 flex-col">
			<Text class="font-bold text-cyan">Focus Controls:</Text>
			<Text class="text-gray">Press 1-4 to focus item directly</Text>
			<Text class="text-gray">Press 'd' to disable/enable item 2</Text>
			<Text class="text-gray mt-1"
				>Item 2 active: {{ item2Active ? 'Yes' : 'No' }}</Text
			>
		</Box>
	</Box>
</template>

<script setup lang="ts">
import { ref, computed, defineComponent, h } from 'vue'
import { Box, Text, useInput, useFocus, useFocusManager } from '@wolfie/vue'

const items = [
	{ id: 'item-1', label: 'First Item', color: 'red' },
	{ id: 'item-2', label: 'Second Item', color: 'green' },
	{ id: 'item-3', label: 'Third Item', color: 'blue' },
	{ id: 'item-4', label: 'Fourth Item', color: 'yellow' },
]

const item2Active = ref(true)
const { focus } = useFocusManager()

// Handle direct focus via number keys and toggle
useInput((input) => {
	const num = parseInt(input)
	if (num >= 1 && num <= 4) {
		focus(`item-${num}`)
	}
	if (input === 'd') {
		item2Active.value = !item2Active.value
	}
})

// Focusable item component
const FocusableItem = defineComponent({
	props: {
		id: { type: String, required: true },
		label: { type: String, required: true },
		color: { type: String, required: true },
		autoFocus: { type: Boolean, default: false },
	},
	setup(props) {
		const isActive = computed(() => {
			if (props.id === 'item-2') return item2Active.value
			return true
		})

		const { isFocused } = useFocus({
			id: props.id,
			autoFocus: props.autoFocus,
			isActive,
		})

		return () =>
			h(
				Box,
				{
					class: [
						'p-1',
						isFocused.value ? 'border-double' : 'border-single',
						isFocused.value ? `border-${props.color}` : 'border-gray',
						!isActive.value ? 'opacity-50' : '',
					]
						.filter(Boolean)
						.join(' '),
				},
				() => [
					h(
						Text,
						{
							class: isFocused.value
								? `text-${props.color} font-bold`
								: isActive.value
									? 'text-white'
									: 'text-gray',
						},
						() =>
							`${isFocused.value ? '> ' : '  '}${props.label}${isFocused.value ? ' (focused)' : ''}${!isActive.value ? ' (disabled)' : ''}`
					),
				]
			)
	},
})
</script>
