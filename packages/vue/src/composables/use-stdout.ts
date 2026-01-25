import { inject } from 'vue'
import { StdoutSymbol } from '../context/symbols'

export interface Stdout {
	stdout: NodeJS.WriteStream
	write: (data: string) => void
}

export const useStdout = (): Stdout => {
	const stdout = inject<Stdout>(StdoutSymbol)
	if (!stdout) {
		throw new Error('useStdout must be used within a WolfieVue app')
	}
	return stdout
}
