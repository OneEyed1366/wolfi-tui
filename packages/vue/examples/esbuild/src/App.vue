<template>
	<Box class="flex-col p-1 w-full">
		<!-- Header -->
		<Box class="mb-1">
			<Text class="text-blue font-bold"> Wolfie Vue Comprehensive Demo </Text>
		</Box>

		<!-- Screen tabs -->
		<Box class="flex-row gap-2 mb-1">
			<Text
				v-for="(screen, i) in screens"
				:key="screen.name"
				:class="i === activeScreen ? 'text-cyan font-bold' : 'text-gray'"
			>
				[{{ i + 1 }}] {{ screen.name }}
			</Text>
		</Box>

		<!-- Active screen -->
		<component :is="screens[activeScreen].component" />

		<!-- Footer -->
		<Box class="mt-1 border-t-single border-gray p-t-1">
			<Text class="text-gray"> tab navigate | 1-6 jump | q quit </Text>
		</Box>
	</Box>
</template>

<script setup lang="ts">
import { ref, markRaw } from 'vue'
import { Box, Text, useInput, useApp } from '@wolfie/vue'
import StyleDemo from './screens/StyleDemo.vue'
import InputDemo from './screens/InputDemo.vue'
import SelectDemo from './screens/SelectDemo.vue'
import StatusDemo from './screens/StatusDemo.vue'
import ListDemo from './screens/ListDemo.vue'
import ErrorDemo from './screens/ErrorDemo.vue'

const screens = [
	{ name: 'Styles', component: markRaw(StyleDemo) },
	{ name: 'Inputs', component: markRaw(InputDemo) },
	{ name: 'Select', component: markRaw(SelectDemo) },
	{ name: 'Status', component: markRaw(StatusDemo) },
	{ name: 'Lists', component: markRaw(ListDemo) },
	{ name: 'Errors', component: markRaw(ErrorDemo) },
]

const activeScreen = ref(0)
const { exit } = useApp()

useInput((input, key) => {
	if (input === 'q') {
		exit()
	}
	// Tab/Shift+Tab for navigation (avoid arrow conflicts with input components)
	if (key.tab && !key.shift) {
		activeScreen.value = (activeScreen.value + 1) % screens.length
	}
	if (key.tab && key.shift) {
		activeScreen.value =
			(activeScreen.value - 1 + screens.length) % screens.length
	}
	// Number keys 1-6 to jump to screen
	const num = parseInt(input)
	if (num >= 1 && num <= screens.length) {
		activeScreen.value = num - 1
	}
})
</script>
