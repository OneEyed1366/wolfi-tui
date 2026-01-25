import { inject } from 'vue'
import { StdinSymbol } from '../context/symbols'

export interface StdinContext {
	stdin: NodeJS.ReadStream
	setRawMode: (value: boolean) => void
	isRawModeSupported: boolean
	internal_exitOnCtrlC: boolean
	internal_eventEmitter: any // EventEmitter from node:events
}

export const useStdin = (): StdinContext => {
	const stdin = inject<StdinContext>(StdinSymbol)
	if (!stdin) {
		throw new Error('useStdin must be used within a WolfieVue app')
	}
	return stdin
}
