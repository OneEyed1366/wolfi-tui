<script>
	import { Box, Text, useFocus } from '@wolfie/svelte'

	let { id, label, color, autoFocus = false, isActive = true } = $props()

	const { isFocused } = useFocus({
		id: id,
		autoFocus: autoFocus,
		isActive: () => isActive,
	})
</script>

<Box className={isFocused()
	? ['p-1 border-double', { borderColor: color }]
	: 'p-1 border-single border-gray'
}>
	<Text className={isFocused()
		? [{ color }, 'font-bold']
		: isActive ? 'text-[#ffffff]' : 'text-gray'
	}>
		{isFocused() ? '> ' : '  '}{label}{isFocused() ? ' (focused)' : ''}{!isActive ? ' (disabled)' : ''}
	</Text>
</Box>
