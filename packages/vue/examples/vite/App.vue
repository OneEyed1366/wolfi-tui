<template>
	<wolfie-box class="p-1 flex-col w-[80]">
		<wolfie-box class="mb-1">
			<wolfie-text class="text-white font-bold"
				>Wolfie Vue Super-Hybrid Demo</wolfie-text
			>
		</wolfie-box>

		<!-- Tailwind Section -->
		<wolfie-box class="border-double border-yellow p-1 mb-1 flex-col w-full">
			<wolfie-text class="text-[cyan]">
				Tailwind: border-double + arbitrary text-[cyan]
			</wolfie-text>
		</wolfie-box>

		<!-- SCSS Section (from SFC style block) -->
		<wolfie-box class="card flex-col mb-1 w-full">
			<wolfie-text class="card-title">SCSS Flavor</wolfie-text>
			<wolfie-text class="text-muted">
				Nested selectors from &lt;style lang="scss"&gt;
			</wolfie-text>
		</wolfie-box>

		<!-- LESS Section (from SFC style block) -->
		<wolfie-box class="less-box flex-col mb-1 w-full">
			<wolfie-text class="less-text">LESS Flavor</wolfie-text>
			<wolfie-text class="text-muted">
				Nesting from &lt;style lang="less"&gt;
			</wolfie-text>
		</wolfie-box>

		<!-- Stylus Section (from SFC style block) -->
		<wolfie-box class="stylus-box flex-col mb-1 w-full">
			<wolfie-text class="stylus-text">Stylus Flavor</wolfie-text>
			<wolfie-text class="text-muted"
				>Indentation-based &lt;style lang="stylus"&gt;</wolfie-text
			>
		</wolfie-box>

		<!-- CSS Modules Section (external .module.css files) -->
		<wolfie-box :class="[cardStyles.card, 'flex-col mb-1 w-full']">
			<wolfie-text :class="cardStyles.cardTitle"
				>CSS Modules Flavor</wolfie-text
			>
			<wolfie-text class="text-muted"
				>Scoped styles from Card.module.css</wolfie-text
			>
		</wolfie-box>

		<!-- SFC Module Style Section -->
		<wolfie-box :class="[$style.moduleBox, 'flex-col mb-1 w-full']">
			<wolfie-text :class="$style.moduleText">SFC Module Style</wolfie-text>
			<wolfie-text class="text-muted"
				>Scoped via &lt;style module&gt;</wolfie-text
			>
		</wolfie-box>

		<!-- Buttons Mix -->
		<wolfie-box class="flex-row gap-2 mb-1 w-full">
			<wolfie-box class="btn primary">
				<wolfie-text>SCSS Btn</wolfie-text>
			</wolfie-box>
			<wolfie-box :class="buttonStyles.button">
				<wolfie-text :class="buttonStyles.text">Module Btn</wolfie-text>
			</wolfie-box>
			<wolfie-box class="bg-blue-600 p-x-2">
				<wolfie-text class="text-white">Tailwind Btn</wolfie-text>
			</wolfie-box>
		</wolfie-box>
	</wolfie-box>
</template>

<script setup lang="ts">
import buttonStyles from './styles/Button.module.css'
import cardStyles from './styles/Card.module.css'
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

<!-- SFC Module styles (scoped via $style binding) -->
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
