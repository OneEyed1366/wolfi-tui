<script lang="ts">
	import { getContext, type Snippet } from 'svelte'
	import Box from './Box.svelte'
	import Text from './Text.svelte'
	import { OL_COUNTER_CTX } from '../context/symbols.js'
	import { useComponentTheme } from '../theme/index.js'
	import { orderedListTheme, type OrderedListTheme } from './list-theme.js'

	let { children }: {
		children: Snippet
	} = $props()

	const ctx = getContext<{ getNextIndex: () => number } | undefined>(OL_COUNTER_CTX)
	const index = ctx?.getNextIndex() ?? 1

	const theme = useComponentTheme<OrderedListTheme>('OrderedList')
	const { styles } = theme ?? orderedListTheme
</script>

<Box {...styles.listItem()}>
	<Text {...styles.marker()}>{index}.</Text>
	<Box {...styles.content()}>
		{@render children()}
	</Box>
</Box>
