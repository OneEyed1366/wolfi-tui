<script setup lang="ts">
import { Box, Text, UnorderedList, Newline, useInput } from '@wolfie/vue'
import type { Screen } from '../composables/useInvaders'
import { BRAND } from '../theme'

//#region Props
const props = defineProps<{
	onNavigate: (screen: Screen) => void
}>()
//#endregion Props

//#region Input Handling
useInput((input, key) => {
	if (key.escape || input === 'q') {
		props.onNavigate('menu')
	}
})
//#endregion Input Handling
</script>

<template>
	<Box
		:style="{
			width: '100vw',
			height: '100vh',
			flexDirection: 'column',
			alignItems: 'center',
			justifyContent: 'center',
			backgroundColor: BRAND.bgDark,
			padding: 2,
		}"
	>
		<Text :style="{ color: BRAND.primary }" class="font-bold text-lg"
			>📖 HELP</Text
		>
		<Newline />

		<Box :style="{ flexDirection: 'row', gap: 4 }">
			<!-- Controls Column -->
			<Box :style="{ flexDirection: 'column' }">
				<Text class="text-yellow font-bold">Controls</Text>
				<UnorderedList>
					<UnorderedList.Item>
						<Text><Text class="text-cyan">←/→</Text> Move ship</Text>
					</UnorderedList.Item>
					<UnorderedList.Item>
						<Text><Text class="text-cyan">Space</Text> Fire</Text>
					</UnorderedList.Item>
					<UnorderedList.Item>
						<Text><Text class="text-cyan">P</Text> Pause</Text>
					</UnorderedList.Item>
					<UnorderedList.Item>
						<Text><Text class="text-cyan">Q/Esc</Text> Quit</Text>
					</UnorderedList.Item>
				</UnorderedList>
			</Box>

			<!-- Scoring Column -->
			<Box :style="{ flexDirection: 'column' }">
				<Text class="text-yellow font-bold">Scoring</Text>
				<UnorderedList>
					<UnorderedList.Item>
						<Text><Text class="text-red">^</Text> Top alien = 30 pts</Text>
					</UnorderedList.Item>
					<UnorderedList.Item>
						<Text><Text class="text-yellow">N</Text> Mid alien = 20 pts</Text>
					</UnorderedList.Item>
					<UnorderedList.Item>
						<Text><Text class="text-green">Y</Text> Bot alien = 10 pts</Text>
					</UnorderedList.Item>
					<UnorderedList.Item>
						<Text>Wave clear = +100 pts</Text>
					</UnorderedList.Item>
				</UnorderedList>
			</Box>
		</Box>

		<Newline />
		<Box :style="{ flexDirection: 'column', alignItems: 'center' }">
			<Text class="text-yellow font-bold">Tips</Text>
			<Text class="text-gray">• Destroy aliens before they reach bottom</Text>
			<Text class="text-gray">• Shields absorb bullets but degrade</Text>
			<Text class="text-gray">• Aliens speed up as you kill them</Text>
		</Box>

		<Newline />
		<Text class="text-gray">Esc Return to menu</Text>
	</Box>
</template>
