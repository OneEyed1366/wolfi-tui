import { useContext } from 'solid-js'
import { FocusCtx } from '../context/symbols'

export interface FocusManagerContext {
	enableFocus: () => void
	disableFocus: () => void
	focusNext: () => void
	focusPrevious: () => void
	focus: (id: string) => void
}

export const useFocusManager = (): FocusManagerContext => {
	const focusContext = useContext(FocusCtx)

	return {
		enableFocus: () => focusContext?.enableFocus(),
		disableFocus: () => focusContext?.disableFocus(),
		focusNext: () => focusContext?.focusNext(),
		focusPrevious: () => focusContext?.focusPrevious(),
		focus: (id: string) => focusContext?.focus(id),
	}
}
