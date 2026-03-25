<script lang="ts">
	import { Box, Text, Spacer, Badge } from '@wolf-tui/svelte'
	import { BRAND } from '../theme'

	//#region Props
	let { score, lives, wave, showFps, fps }: {
		score: number
		lives: number
		wave: number
		showFps?: boolean
		fps?: number
	} = $props()
	//#endregion Props

	let formattedScore = $derived(score.toString().padStart(6, '0'))
	let livesHearts = $derived(
		Array.from({ length: lives }, () => '♥').join(' ')
	)
</script>

<Box className="flex-row w-full">
	<Box>
		<Text className={[{ color: BRAND.primary }, 'font-bold']}>
			SCORE{' '}
		</Text>
		<Text className={[{ color: BRAND.bgDark, backgroundColor: BRAND.primary }, 'font-bold']}>
			{' ' + formattedScore + ' '}
		</Text>
	</Box>

	<Spacer />

	<Box>
		<Text className={[{ color: BRAND.error }, 'font-bold']}>
			LIVES{' '}
		</Text>
		<Text className={{ color: BRAND.error }}>{livesHearts}</Text>
	</Box>

	<Spacer />

	<Box>
		<Text className={[{ color: BRAND.primary }, 'font-bold']}>
			WAVE{' '}
		</Text>
		<Badge color={BRAND.primaryDark} label={wave.toString()} />
	</Box>

	{#if showFps}
		<Spacer />
		<Box>
			<Text className={{ color: BRAND.textMuted }}>FPS </Text>
			<Text className={{ color: BRAND.success }}>{fps ?? 0}</Text>
		</Box>
	{/if}
</Box>
