import {
	inject,
	computed,
	onMounted,
	onUnmounted,
	watchEffect,
	toValue,
	type MaybeRefOrGetter,
	type Ref,
} from 'vue'
import { FocusSymbol } from '../context/symbols'
import { useStdin } from './use-stdin'

//#region Types
export interface FocusOptions {
	/**
	 * Enable/disable focus eligibility while keeping component in focus chain.
	 * When false, component won't receive focus but stays registered.
	 * @default true
	 */
	isActive?: MaybeRefOrGetter<boolean>

	/**
	 * Auto-focus this component if no component is currently focused.
	 * @default false
	 */
	autoFocus?: boolean

	/**
	 * Custom identifier for this focusable component.
	 * Defaults to a random string if not provided.
	 */
	id?: string
}

export interface FocusContext {
	activeFocusId: Ref<string | undefined>
	add: (id: string, options: { autoFocus: boolean }) => void
	remove: (id: string) => void
	activate: (id: string) => void
	deactivate: (id: string) => void
	focus: (id: string) => void
}
//#endregion Types

//#region Helpers
const generateId = () => Math.random().toString(36).slice(2, 11)
//#endregion Helpers

/**
 * Makes a component focusable within the focus management system.
 *
 * @example
 * ```vue
 * <script setup>
 * import { useFocus } from '@wolfie/vue'
 *
 * const { isFocused, focus } = useFocus({ autoFocus: true })
 * </script>
 * ```
 */
export const useFocus = (options: FocusOptions = {}) => {
	const focusContext = inject<FocusContext | undefined>(FocusSymbol, undefined)
	const { setRawMode, isRawModeSupported } = useStdin()

	const id = options.id ?? generateId()
	const autoFocus = options.autoFocus ?? false

	// Computed to check if this component is focused
	const isFocused = computed(() => {
		if (!focusContext) return false
		return focusContext.activeFocusId.value === id
	})

	// Register/unregister on mount/unmount
	onMounted(() => {
		focusContext?.add(id, { autoFocus })
	})

	onUnmounted(() => {
		focusContext?.remove(id)
	})

	// Handle isActive changes - activate/deactivate without removing from chain
	watchEffect(() => {
		if (!focusContext) return

		const isActive = toValue(options.isActive)
		if (isActive === false) {
			focusContext.deactivate(id)
		} else {
			focusContext.activate(id)
		}
	})

	// Enable raw mode when focused and active (same pattern as React)
	watchEffect((onCleanup) => {
		const isActive = toValue(options.isActive)
		if (isActive === false || !isFocused.value || !isRawModeSupported) {
			return
		}

		setRawMode(true)

		onCleanup(() => {
			setRawMode(false)
		})
	})

	// Expose focus method to programmatically focus any element
	const focus = (targetId: string) => {
		focusContext?.focus(targetId)
	}

	return {
		/** Whether this component currently has focus */
		isFocused,
		/** Programmatically focus any element by ID */
		focus,
		/** This component's focus ID */
		id,
	}
}
