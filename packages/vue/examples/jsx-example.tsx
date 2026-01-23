/* eslint-disable react-hooks/rules-of-hooks */
/// <reference types="vue/jsx-runtime" />
import { defineComponent, ref } from 'vue'
import { render, Box, Text, useInput, useApp } from '@wolfie/vue'

const App = defineComponent({
	name: 'App',
	setup() {
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
				input ||
				(Object.keys(key).find((k) => key[k as keyof typeof key]) ?? '')
		})

		return () => (
			<Box
				style={{
					padding: 1,
					borderStyle: 'round',
					borderColor: 'cyan',
					flexDirection: 'column',
				}}
			>
				<Text style={{ color: 'green', fontWeight: 'bold' }}>
					Wolfie Vue JSX Example
				</Text>
				<Box style={{ marginTop: 1, flexDirection: 'column' }}>
					<Text>Count: {count.value} (Use Up/Down)</Text>
					<Text>Last Input: {lastKey.value}</Text>
					<Text style={{ color: 'dim' }}>Press 'q' to exit</Text>
				</Box>
			</Box>
		)
	},
})

render(<App />)
