import { inject } from 'vue'
import { AppSymbol } from '../symbols'

export const useApp = () => {
	const app = inject(AppSymbol)
	if (!app) {
		throw new Error('useApp must be used within a WolfieVue app')
	}
	return app
}
