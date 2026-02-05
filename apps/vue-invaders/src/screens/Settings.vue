<script setup lang="ts">
import { ref, computed } from 'vue'
import { Box, Text, Select, MultiSelect, Newline, useInput } from '@wolfie/vue'
import type {
	Screen,
	Settings as SettingsType,
	Difficulty,
} from '../composables/useInvaders'
import { BRAND } from '../theme'

//#region Props
const props = defineProps<{
	settings: SettingsType
	onUpdateSettings: (settings: Partial<SettingsType>) => void
	onNavigate: (screen: Screen) => void
}>()
//#endregion Props

//#region Options
const DIFFICULTY_OPTIONS = [
	{ label: 'Easy - Slower aliens', value: 'easy' },
	{ label: 'Normal - Standard', value: 'normal' },
	{ label: 'Hard - Fast aliens', value: 'hard' },
]

const TOGGLE_OPTIONS = [
	{ label: 'Show FPS Counter', value: 'showFps' },
	{ label: 'Shield Health Bars', value: 'shieldBars' },
	{ label: 'Kill Log', value: 'killLog' },
	{ label: 'Alien Animation', value: 'alienAnim' },
	{ label: 'Debug Mode', value: 'debug' },
]
//#endregion Options

//#region State
type Section = 'difficulty' | 'options'
const section = ref<Section>('difficulty')

// Current toggles based on settings
const currentToggles = computed(() => {
	const toggles: string[] = []
	if (props.settings.showFps) toggles.push('showFps')
	if (props.settings.shieldBars) toggles.push('shieldBars')
	if (props.settings.killLog) toggles.push('killLog')
	if (props.settings.alienAnim) toggles.push('alienAnim')
	if (props.settings.debug) toggles.push('debug')
	return toggles
})
//#endregion State

//#region Input Handling
useInput((input, key) => {
	if (key.escape || input === 'q') {
		props.onNavigate('menu')
		return
	}
	if (key.tab) {
		section.value = section.value === 'difficulty' ? 'options' : 'difficulty'
	}
})

function handleDifficultyChange(value: string) {
	// Only update if value actually changed
	if (value === props.settings.difficulty) return
	props.onUpdateSettings({ difficulty: value as Difficulty })
}

function handleTogglesChange(values: string[]) {
	// Only update if values actually changed
	const current = currentToggles.value
	if (
		values.length === current.length &&
		values.every((v) => current.includes(v))
	)
		return
	props.onUpdateSettings({
		showFps: values.includes('showFps'),
		shieldBars: values.includes('shieldBars'),
		killLog: values.includes('killLog'),
		alienAnim: values.includes('alienAnim'),
		debug: values.includes('debug'),
	})
}
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
			>⚙ SETTINGS</Text
		>
		<Newline />

		<Text
			:class="section === 'difficulty' ? 'text-yellow font-bold' : 'text-gray'"
		>
			Difficulty: {{ section !== 'difficulty' ? '(Tab to switch)' : '' }}
		</Text>
		<Select
			:options="DIFFICULTY_OPTIONS"
			:value="settings.difficulty"
			:visible-option-count="3"
			:is-disabled="section !== 'difficulty'"
			@change="handleDifficultyChange"
		/>

		<Newline />
		<Text
			:class="section === 'options' ? 'text-yellow font-bold' : 'text-gray'"
		>
			Options: {{ section !== 'options' ? '(Tab to switch)' : '' }}
		</Text>
		<MultiSelect
			:options="TOGGLE_OPTIONS"
			:value="currentToggles"
			:visible-option-count="5"
			:is-disabled="section !== 'options'"
			@change="handleTogglesChange"
		/>

		<Newline />
		<Text class="text-gray">Tab Switch • Esc Menu</Text>
	</Box>
</template>
