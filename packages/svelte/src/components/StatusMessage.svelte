<script lang="ts">
	import {
		renderStatusMessage,
		defaultStatusMessageTheme,
		type StatusMessageRenderTheme,
	} from '@wolfie/shared'
	import { mountWNode } from '../wnode/wnode-to-svelte.js'
	import { useComponentTheme } from '../theme/index.js'

	//#region Types
	type StatusMessageVariant = 'info' | 'success' | 'error' | 'warning'
	//#endregion Types

	let { variant, message = '' }: {
		variant: StatusMessageVariant
		message?: string
	} = $props()

	const theme = useComponentTheme<StatusMessageRenderTheme>('StatusMessage')
	const { styles, config } = theme ?? defaultStatusMessageTheme

	let wnode = $derived(renderStatusMessage(
		{ variant, message },
		{ styles, config }
	))
</script>

<wolfie-box use:mountWNode={wnode}></wolfie-box>
