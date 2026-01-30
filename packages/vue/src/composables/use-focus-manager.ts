import { inject } from 'vue'
import { FocusSymbol } from '../context/symbols'

//#region Types
export interface FocusManagerContext {
	enableFocus: () => void
	disableFocus: () => void
	focusNext: () => void
	focusPrevious: () => void
	focus: (id: string) => void
}
//#endregion Types

/**
 * Exposes focus control methods at the application level.
 *
 * @example
 * ```vue
 * <script setup>
 * import { useFocusManager } from '@wolfie/vue'
 *
 * const { focusNext, focusPrevious, focus } = useFocusManager()
 *
 * // Navigate focus programmatically
 * const handleSubmit = () => {
 *   focusNext()
 * }
 * </script>
 * ```
 */
export const useFocusManager = (): FocusManagerContext => {
	const focusContext = inject<FocusManagerContext | undefined>(
		FocusSymbol,
		undefined
	)

	return {
		enableFocus: () => focusContext?.enableFocus(),
		disableFocus: () => focusContext?.disableFocus(),
		focusNext: () => focusContext?.focusNext(),
		focusPrevious: () => focusContext?.focusPrevious(),
		focus: (id: string) => focusContext?.focus(id),
	}
}
