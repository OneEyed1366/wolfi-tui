<script lang="ts">
	import type { Snippet } from 'svelte'
	import figures from 'figures'
	import Box from './Box.svelte'
	import Text from './Text.svelte'
	import { useComponentTheme } from '../theme/index.js'
	import { defaultOptionTheme, type OptionTheme } from './option-theme.js'

	let { isFocused, isSelected, children }: {
		isFocused: boolean
		isSelected: boolean
		children?: Snippet
	} = $props()

	const theme = useComponentTheme<OptionTheme>('SelectOption')
	const { styles } = theme ?? defaultOptionTheme
</script>

<Box {...styles.option({ isFocused })}>
	{#if isFocused}
		<Text {...styles.focusIndicator()}>{figures.pointer}</Text>
	{/if}
	<Text {...styles.label({ isFocused, isSelected })}>
		{#if children}
			{@render children()}
		{/if}
	</Text>
	{#if isSelected}
		<Text {...styles.selectedIndicator()}>{figures.tick}</Text>
	{/if}
</Box>
