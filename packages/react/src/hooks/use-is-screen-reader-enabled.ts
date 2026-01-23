import { useContext } from 'react'
import { accessibilityContext } from '../context/AccessibilityContext'

/**
Returns whether a screen reader is enabled. This is useful when you want to render different output for screen readers.
*/
export const useIsScreenReaderEnabled = (): boolean => {
	const { isScreenReaderEnabled } = useContext(accessibilityContext)
	return isScreenReaderEnabled
}
