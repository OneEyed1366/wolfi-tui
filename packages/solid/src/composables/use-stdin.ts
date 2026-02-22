import { useContext } from 'solid-js'
import { StdinCtx } from '../context/symbols'
import type { StdinContextValue } from '../context/types'

export const useStdin = (): StdinContextValue => {
	const ctx = useContext(StdinCtx)
	if (!ctx) {
		throw new Error('useStdin must be used within a WolfieSolid app')
	}
	return ctx
}
