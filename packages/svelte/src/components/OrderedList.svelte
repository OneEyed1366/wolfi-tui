<script lang="ts">
	import { setContext, type Snippet } from 'svelte'
	import Box from './Box.svelte'
	import { OL_COUNTER_CTX } from '../context/symbols.js'
	import { useComponentTheme } from '../theme/index.js'
	import { orderedListTheme, type OrderedListTheme } from './list-theme.js'

	let { children }: {
		children: Snippet
	} = $props()

	// Mutable counter — resets each mount, increments per OrderedListItem
	let counter = 0
	const getNextIndex = () => ++counter

	setContext(OL_COUNTER_CTX, { getNextIndex })

	const theme = useComponentTheme<OrderedListTheme>('OrderedList')
	const { styles } = theme ?? orderedListTheme
</script>

<Box {...styles.list()}>
	{@render children()}
</Box>
