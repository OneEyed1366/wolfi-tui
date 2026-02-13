import {
	onMounted,
	onUnmounted,
	watchEffect,
	toValue,
	type MaybeRefOrGetter,
} from 'vue'
import { parseInputData, type IKey } from '@wolfie/shared'
import { useStdin } from './use-stdin'

export type Key = IKey

export type Handler = (input: string, key: Key) => void

export type Options = {
	isActive?: MaybeRefOrGetter<boolean>
}

// Debug flag - set to true to see input handling logs

export const useInput = (inputHandler: Handler, options: Options = {}) => {
	const { setRawMode, internal_exitOnCtrlC, internal_eventEmitter } = useStdin()

	// Raw mode subscription with conditional cleanup (same pattern as React package)
	// Only register cleanup when active - prevents false decrement when mounting inactive
	watchEffect((onCleanup) => {
		const isActive = toValue(options.isActive)
		if (isActive === false) {
			return // Early return - no cleanup registered for inactive components
		}
		setRawMode(true)

		onCleanup(() => {
			setRawMode(false)
		})
	})

	const handleData = (data: string) => {
		if (toValue(options.isActive) === false) {
			return
		}

		const { input, key } = parseInputData(data)

		if (!(input === 'c' && key.ctrl) || !internal_exitOnCtrlC) {
			inputHandler(input, key)
		}
	}

	onMounted(() => {
		if (internal_eventEmitter) {
			internal_eventEmitter.on('input', handleData)
		}
	})

	onUnmounted(() => {
		if (internal_eventEmitter) {
			internal_eventEmitter.off('input', handleData)
		}
	})
}
