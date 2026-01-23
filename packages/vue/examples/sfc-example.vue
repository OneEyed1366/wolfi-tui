<template>
	<Box
		:style="{
			padding: 1,
			borderStyle: 'round',
			borderColor: 'magenta',
			flexDirection: 'column',
		}"
	>
		<Text :style="{ color: 'green', fontWeight: 'bold' }">
			Wolfie Vue SFC Example
		</Text>
		<Box :style="{ marginTop: 1, flexDirection: 'column' }">
			<Text>Count: {{ count }} (Use Up/Down)</Text>
			<Text>Last Input: {{ lastKey }}</Text>
			<Text :style="{ color: 'dim' }">Press 'q' to exit</Text>
		</Box>
	</Box>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Box, Text, useInput, useApp } from '@wolfie/vue'

const count = ref(0)
const lastKey = ref('')
const { exit } = useApp()

useInput((input, key) => {
	if (input === 'q') {
		exit()
	}

	if (key.upArrow) count.value++
	if (key.downArrow) count.value--

	lastKey.value =
		input || (Object.keys(key).find((k) => key[k as keyof typeof key]) ?? '')
})
</script>
