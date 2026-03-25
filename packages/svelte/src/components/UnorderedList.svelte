<script lang="ts">
	import { setContext, getContext, type Snippet } from 'svelte'
	import figures from 'figures'
	import Box from './Box.svelte'
	import { UL_DEPTH_CTX, UL_MARKER_CTX } from '../context/symbols.js'
	import { useComponentTheme } from '../theme/index.js'
	import { unorderedListTheme, type UnorderedListTheme } from './list-theme.js'

	let { children }: {
		children: Snippet
	} = $props()

	const theme = useComponentTheme<UnorderedListTheme>('UnorderedList')
	const { styles, config } = theme ?? unorderedListTheme

	const markers = config().marker
	const markerList = Array.isArray(markers) ? markers : [markers]

	const parentDepth = getContext<number | undefined>(UL_DEPTH_CTX) ?? 0
	const marker = markerList[parentDepth % markerList.length] ?? figures.bullet

	setContext(UL_DEPTH_CTX, parentDepth + 1)
	setContext(UL_MARKER_CTX, marker)
</script>

<Box {...styles.list()}>
	{@render children()}
</Box>
