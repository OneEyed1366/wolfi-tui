<template>
	<Box class="flex-col w-full">
		<!-- Tailwind Section -->
		<Box class="border-double border-yellow p-1 mb-1 flex-col w-full">
			<Text class="text-[cyan]">
				Tailwind: border-double + arbitrary text-[cyan]
			</Text>
		</Box>

		<!-- SCSS Section -->
		<Box class="card flex-col mb-1 w-full">
			<Text class="card-title">SCSS Flavor</Text>
			<Text class="text-muted"> Nested selectors from style lang="scss" </Text>
		</Box>

		<!-- LESS Section -->
		<Box class="less-box flex-col mb-1 w-full">
			<Text class="less-text">LESS Flavor</Text>
			<Text class="text-muted"> Nesting from style lang="less" </Text>
		</Box>

		<!-- Stylus Section -->
		<Box class="stylus-box flex-col mb-1 w-full">
			<Text class="stylus-text">Stylus Flavor</Text>
			<Text class="text-muted">Indentation-based style lang="stylus"</Text>
		</Box>

		<!-- CSS Modules Section -->
		<Box :class="[cardStyles.card, 'flex-col mb-1 w-full']">
			<Text :class="cardStyles.cardTitle">CSS Modules Flavor</Text>
			<Text class="text-muted">Scoped styles from Card.module.css</Text>
		</Box>

		<!-- SFC Module Style Section -->
		<Box :class="[$style.moduleBox, 'flex-col mb-1 w-full']">
			<Text :class="$style.moduleText">SFC Module Style</Text>
			<Text class="text-muted">Scoped via style module</Text>
		</Box>

		<!-- Buttons Mix -->
		<Box class="flex-row gap-2 w-full">
			<Box class="btn primary">
				<Text>SCSS Btn</Text>
			</Box>
			<Box :class="buttonStyles.button">
				<Text :class="buttonStyles.text">Module Btn</Text>
			</Box>
			<Box class="bg-blue-600 p-x-2">
				<Text class="text-white">Tailwind Btn</Text>
			</Box>
		</Box>
	</Box>
</template>

<script setup lang="ts">
import { Box, Text } from '@wolfie/vue'
import buttonStyles from '../styles/Button.module.css'
import cardStyles from '../styles/Card.module.css'

// Import global styles (side-effects)
import './StyleDemo.css'
import './StyleDemo.scss'
import './StyleDemo.less'
import './StyleDemo.styl'

// Import module styles and expose as $style for template
import styleDemoModule from './StyleDemo.module.css'
const $style = styleDemoModule
</script>
