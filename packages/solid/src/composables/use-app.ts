import { useContext } from 'solid-js'
import { AppCtx } from '../context/symbols'
import type { AppContextValue } from '../context/types'

export const useApp = (): AppContextValue => {
	const ctx = useContext(AppCtx)
	if (!ctx) {
		throw new Error('useApp must be used within a WolfieSolid app')
	}
	return ctx
}
