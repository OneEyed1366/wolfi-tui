import { useContext } from 'solid-js'
import { StderrCtx } from '../context/symbols'
import type { StderrContextValue } from '../context/types'

export const useStderr = (): StderrContextValue => {
	const ctx = useContext(StderrCtx)
	if (!ctx) {
		throw new Error('useStderr must be used within a WolfieSolid app')
	}
	return ctx
}
