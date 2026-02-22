import { useContext } from 'solid-js'
import { AccessibilityCtx } from '../context/symbols'

// WHY: reads from AccessibilityCtx which is always provided by WolfieSolid.render()
export const useIsScreenReaderEnabled = (): boolean => {
	const ctx = useContext(AccessibilityCtx)
	return ctx?.isScreenReaderEnabled ?? false
}
