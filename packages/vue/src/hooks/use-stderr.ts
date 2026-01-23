import { inject } from 'vue'
import { StderrSymbol } from '../symbols'

export const useStderr = () => {
	const stderr = inject(StderrSymbol)
	if (!stderr) {
		throw new Error('useStderr must be used within a WolfieVue app')
	}
	return stderr
}
