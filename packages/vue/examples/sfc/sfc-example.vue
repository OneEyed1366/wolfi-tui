<template>
	<wolfie-box
		:style="{
			padding: 1,
			borderStyle: 'round',
			borderColor: 'magenta',
			flexDirection: 'column',
		}"
	>
		<wolfie-text :style="{ color: 'green', fontWeight: 'bold' }">
			Wolfie Vue SFC Example
		</wolfie-text>
		<wolfie-box :style="{ marginTop: 1, flexDirection: 'column' }">
			<wolfie-box :style="{ flexDirection: 'row' }">
				<wolfie-text>Count: </wolfie-text>
				<wolfie-text :key="count">{{ count }}</wolfie-text>
				<wolfie-text> (Use Up/Down)</wolfie-text>
			</wolfie-box>
			<wolfie-text>Last Input: {{ lastKey }}</wolfie-text>
			<wolfie-text :style="{ color: 'dim' }">Press 'q' to exit</wolfie-text>
		</wolfie-box>
	</wolfie-box>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useInput, useApp } from '@wolfie/vue'

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
