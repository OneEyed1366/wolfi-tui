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
</script>

<!-- Global utility classes -->
<style>
.text-base {
	color: white;
}

.text-muted {
	color: gray;
}
</style>

<!-- SCSS styles with nesting -->
<style lang="scss">
$primary: magenta;

.card {
	border-style: single;
	padding: 1;
	border-color: $primary;

	.title {
		color: $primary;
		font-weight: bold;
	}
}

.btn {
	padding-x: 2;
	padding-y: 1;
	border-style: single;
	border-color: $primary;

	&.primary {
		border-color: $primary;
	}
}
</style>

<!-- LESS styles with nesting -->
<style lang="less">
@green: green;

.less-box {
	border-style: single;
	border-color: @green;
	padding: 1;

	.less-text {
		color: @green;
		font-weight: bold;
	}
}
</style>

<!-- Stylus styles with indentation -->
<style lang="stylus">
$yellow = yellow

.stylus-box
	border-style single
	border-color $yellow
	padding 1

	.stylus-text
		color $yellow
		font-style italic
</style>

<!-- SFC Module styles -->
<style module>
.moduleBox {
	border-style: double;
	border-color: white;
	padding: 1;
}

.moduleText {
	color: white;
	font-weight: bold;
}
</style>
