import { inject } from 'vue'
import { StderrSymbol } from '../context/symbols'

export interface Stderr {
	stderr: NodeJS.WriteStream
	write: (data: string) => void
}

export const useStderr = (): Stderr => {
	const stderr = inject<Stderr>(StderrSymbol)
	if (!stderr) {
		throw new Error('useStderr must be used within a WolfieVue app')
	}
	return stderr
}
