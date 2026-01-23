import { inject } from 'vue'
import { StdoutSymbol } from '../symbols'

export const useStdout = () => {
	const stdout = inject(StdoutSymbol)
	if (!stdout) {
		throw new Error('useStdout must be used within a WolfieVue app')
	}
	return stdout
}
