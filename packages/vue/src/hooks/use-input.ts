import { onMounted, onUnmounted, watch } from 'vue'
import { parseKeypress, nonAlphanumericKeys } from '@wolfie/core'
import { useStdin } from './use-stdin'

export type Key = {
	upArrow: boolean
	downArrow: boolean
	leftArrow: boolean
	rightArrow: boolean
	pageDown: boolean
	pageUp: boolean
	home: boolean
	end: boolean
	return: boolean
	escape: boolean
	ctrl: boolean
	shift: boolean
	tab: boolean
	backspace: boolean
	delete: boolean
	meta: boolean
}

type Handler = (input: string, key: Key) => void

type Options = {
	isActive?: boolean
}

export const useInput = (inputHandler: Handler, options: Options = {}) => {
	const { setRawMode, internal_exitOnCtrlC, internal_eventEmitter } = useStdin()

	watch(
		() => options.isActive,
		(isActive) => {
			if (isActive !== false) {
				setRawMode(true)
			} else {
				setRawMode(false)
			}
		},
		{ immediate: true }
	)

	onUnmounted(() => {
		setRawMode(false)
	})

	const handleData = (data: string) => {
		if (options.isActive === false) {
			return
		}

		const keypress = parseKeypress(data)

		const key: Key = {
			upArrow: keypress.name === 'up',
			downArrow: keypress.name === 'down',
			leftArrow: keypress.name === 'left',
			rightArrow: keypress.name === 'right',
			pageDown: keypress.name === 'pagedown',
			pageUp: keypress.name === 'pageup',
			home: keypress.name === 'home',
			end: keypress.name === 'end',
			return: keypress.name === 'return',
			escape: keypress.name === 'escape',
			ctrl: keypress.ctrl,
			shift: keypress.shift,
			tab: keypress.name === 'tab',
			backspace: keypress.name === 'backspace',
			delete: keypress.name === 'delete',
			meta: keypress.meta || keypress.name === 'escape' || keypress.option,
		}

		let input = keypress.ctrl ? keypress.name : keypress.sequence

		if (nonAlphanumericKeys.includes(keypress.name)) {
			input = ''
		}

		if (input.startsWith('\u001B')) {
			input = input.slice(1)
		}

		if (
			input.length === 1 &&
			typeof input[0] === 'string' &&
			/[A-Z]/.test(input[0])
		) {
			key.shift = true
		}

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
