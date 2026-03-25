<script lang="ts">
	import { getContext, type Snippet } from 'svelte'
	import figures from 'figures'
	import Box from './Box.svelte'
	import Text from './Text.svelte'
	import { UL_MARKER_CTX } from '../context/symbols.js'
	import { useComponentTheme } from '../theme/index.js'
	import { unorderedListTheme, type UnorderedListTheme } from './list-theme.js'

	let { children }: {
		children: Snippet
	} = $props()

	const marker = getContext<string | undefined>(UL_MARKER_CTX) ?? figures.line

	const theme = useComponentTheme<UnorderedListTheme>('UnorderedList')
	const { styles } = theme ?? unorderedListTheme
</script>

<Box {...styles.listItem()}>
	<Text {...styles.marker()}>{marker}</Text>
	<Box {...styles.content()}>
		{@render children()}
	</Box>
</Box>
