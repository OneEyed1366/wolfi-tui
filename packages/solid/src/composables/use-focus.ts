import { createEffect, createMemo, onCleanup, useContext } from 'solid-js'
import { FocusCtx } from '../context/symbols'
import { useStdin } from './use-stdin'

//#region Types
export interface FocusOptions {
	isActive?: () => boolean
	autoFocus?: boolean
	id?: string
}
//#endregion Types

const generateId = () => Math.random().toString(36).slice(2, 11)

export const useFocus = (options: FocusOptions = {}) => {
	const focusContext = useContext(FocusCtx)
	const { setRawMode, isRawModeSupported } = useStdin()

	const id = options.id ?? generateId()
	const autoFocus = options.autoFocus ?? false

	const isFocused = createMemo(() => {
		if (!focusContext) return false
		return focusContext.activeFocusId() === id
	})

	// Register immediately — onMount doesn't fire in universal renderer
	focusContext?.add(id, { autoFocus })

	onCleanup(() => {
		focusContext?.remove(id)
	})

	// Handle isActive changes
	createEffect(() => {
		if (!focusContext) return
		const isActive = options.isActive?.()
		if (isActive === false) {
			focusContext.deactivate(id)
		} else {
			focusContext.activate(id)
		}
	})

	// Enable raw mode when focused and active
	createEffect(() => {
		const isActive = options.isActive?.()
		if (isActive === false || !isFocused() || !isRawModeSupported) return

		setRawMode(true)

		onCleanup(() => {
			setRawMode(false)
		})
	})

	const focus = (targetId: string) => {
		focusContext?.focus(targetId)
	}

	return {
		isFocused,
		focus,
		id,
	}
}
