import { useContext } from 'solid-js'
import { StdoutCtx } from '../context/symbols'
import type { StdoutContextValue } from '../context/types'

export const useStdout = (): StdoutContextValue => {
	const ctx = useContext(StdoutCtx)
	if (!ctx) {
		throw new Error('useStdout must be used within a WolfieSolid app')
	}
	return ctx
}
