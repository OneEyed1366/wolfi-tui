import { inject } from 'vue'
import { AppSymbol } from '../context/symbols'

export interface App {
	exit: (error?: Error) => void
}

export const useApp = (): App => {
	const app = inject<App>(AppSymbol)
	if (!app) {
		throw new Error('useApp must be used within a WolfieVue app')
	}
	return app
}
