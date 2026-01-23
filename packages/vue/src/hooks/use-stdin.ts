import { inject } from 'vue'
import { StdinSymbol } from '../symbols'

export const useStdin = () => {
	const stdin = inject(StdinSymbol)
	if (!stdin) {
		throw new Error('useStdin must be used within a WolfieVue app')
	}
	return stdin
}
