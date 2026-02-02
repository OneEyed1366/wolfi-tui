<script setup lang="ts">
import { computed } from 'vue'
import { Box, Text, Spacer } from '@wolfie/vue'
import { BRAND } from '../theme'

//#region Props
const props = defineProps<{
	score: number
	lives: number
	wave: number
	showFps?: boolean
	fps?: number
}>()
//#endregion Props

//#region Computed
const formattedScore = computed(() => props.score.toString().padStart(6, '0'))
const livesHearts = computed(() =>
	Array.from({ length: props.lives }, () => '♥').join(' ')
)
//#endregion Computed
</script>

<template>
	<Box :style="{ flexDirection: 'row', width: '100%' }">
		<Box>
			<Text :style="{ color: BRAND.primary }" class="font-bold">SCORE </Text>
			<Text
				:style="{ color: BRAND.bgDark, backgroundColor: BRAND.primary }"
				class="font-bold"
			>
				{{ ' ' + formattedScore + ' ' }}
			</Text>
		</Box>

		<Spacer />

		<Box>
			<Text :style="{ color: BRAND.error }" class="font-bold">LIVES </Text>
			<Text :style="{ color: BRAND.error }">{{ livesHearts }}</Text>
		</Box>

		<Spacer />

		<Box>
			<Text :style="{ color: BRAND.primary }" class="font-bold">WAVE </Text>
			<Text
				:style="{ color: BRAND.bgDark, backgroundColor: BRAND.primaryDark }"
				class="font-bold"
			>
				{{ ' ' + wave + ' ' }}
			</Text>
		</Box>

		<template v-if="showFps">
			<Spacer />
			<Box>
				<Text :style="{ color: BRAND.textMuted }">FPS </Text>
				<Text :style="{ color: BRAND.success }">{{ fps ?? 0 }}</Text>
			</Box>
		</template>
	</Box>
</template>
