<script lang="ts">
	import {
		renderTextInput,
		defaultTextInputTheme,
		type TextInputRenderTheme,
	} from '@wolf-tui/shared'
	import { mountWNode } from '../wnode/wnode-to-svelte.js'
	import { useComponentTheme } from '../theme/index.js'
	import { useTextInputState } from '../composables/use-text-input-state.svelte.js'
	import { useTextInput } from '../composables/use-text-input.js'

	let {
		isDisabled,
		placeholder,
		defaultValue,
		suggestions,
		onChange,
		onSubmit,
	}: {
		isDisabled?: boolean
		placeholder?: string
		defaultValue?: string
		suggestions?: string[]
		onChange?: (value: string) => void
		onSubmit?: (value: string) => void
	} = $props()

	const state = useTextInputState({ defaultValue, suggestions, onChange, onSubmit })
	const { inputValue } = useTextInput({
		isDisabled: () => isDisabled,
		placeholder,
		state,
	})

	const theme = useComponentTheme<TextInputRenderTheme>('TextInput')
	const { styles } = theme ?? defaultTextInputTheme

	let wnode = $derived(renderTextInput({ inputValue: inputValue() }, { styles }))
</script>

<wolfie-box use:mountWNode={wnode}></wolfie-box>
