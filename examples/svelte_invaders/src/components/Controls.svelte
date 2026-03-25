<script lang="ts">
	import { Box, Text } from '@wolfie/svelte'
	import { BRAND } from '../theme'

	//#region Constants
	const MIN_CONTROLS_WIDTH = 25
	const NBSP = '\u00A0'
	//#endregion Constants
</script>

<Box className={['flex-col', { minWidth: MIN_CONTROLS_WIDTH }]}>
	<Text className={[{ color: BRAND.primary }, 'font-bold']}>
		🎮 Controls
	</Text>
	<Text>
		<Text className={{ color: BRAND.primary }}>←/→</Text>
		<Text className={{ color: BRAND.textMuted }}>{NBSP}Move </Text>
		<Text className={{ color: BRAND.primary }}>Space</Text>
		<Text className={{ color: BRAND.textMuted }}>{NBSP}Shoot</Text>
	</Text>
	<Text>
		<Text className={{ color: BRAND.primary }}>P</Text>
		<Text className={{ color: BRAND.textMuted }}>{NBSP}Pause </Text>
		<Text className={{ color: BRAND.primary }}>Q</Text>
		<Text className={{ color: BRAND.textMuted }}>{NBSP}Quit</Text>
	</Text>
</Box>
