import { createEffect, onCleanup } from 'solid-js'
import { parseInputData, type IKey } from '@wolfie/shared'
import { useStdin } from './use-stdin'

export type Key = IKey

export type Handler = (input: string, key: Key) => void

export type Options = {
	isActive?: () => boolean
}

export const useInput = (inputHandler: Handler, options: Options = {}) => {
	const { setRawMode, internal_exitOnCtrlC, internal_eventEmitter } = useStdin()

	// Raw mode subscription with conditional cleanup
	createEffect(() => {
		const isActive = options.isActive?.()
		if (isActive === false) return

		setRawMode(true)

		onCleanup(() => {
			setRawMode(false)
		})
	})

	const handleData = (data: string) => {
		if (options.isActive?.() === false) return

		const { input, key } = parseInputData(data)

		if (!(input === 'c' && key.ctrl) || !internal_exitOnCtrlC) {
			inputHandler(input, key)
		}
	}

	// Register immediately — onMount doesn't fire in universal renderer
	if (internal_eventEmitter) {
		internal_eventEmitter.on('input', handleData)
	}

	onCleanup(() => {
		if (internal_eventEmitter) {
			internal_eventEmitter.off('input', handleData)
		}
	})
}
