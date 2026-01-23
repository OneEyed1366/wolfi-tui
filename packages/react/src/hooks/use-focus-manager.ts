import { useContext } from 'react'
import { type IProps, FocusContext } from '../context/FocusContext'

type IOutput = {
	/**
	Enable focus management for all components.
	*/
	enableFocus: IProps['enableFocus']

	/**
	Disable focus management for all components. The currently active component (if there's one) will lose its focus.
	*/
	disableFocus: IProps['disableFocus']

	/**
	Switch focus to the next focusable component. If there's no active component right now, focus will be given to the first focusable component. If the active component is the last in the list of focusable components, focus will be switched to the first focusable component.
	*/
	focusNext: IProps['focusNext']

	/**
	Switch focus to the previous focusable component. If there's no active component right now, focus will be given to the first focusable component. If the active component is the first in the list of focusable components, focus will be switched to the last focusable component.
	*/
	focusPrevious: IProps['focusPrevious']

	/**
	Switch focus to the element with the provided `id`. If there's no element with that `id`, focus will be given to the first focusable component.
	*/
	focus: IProps['focus']
}

/**
This hook exposes methods to enable or disable focus management for all components or manually switch focus to the next or previous components.
*/
export const useFocusManager = (): IOutput => {
	const focusContext = useContext(FocusContext)

	return {
		enableFocus: focusContext.enableFocus,
		disableFocus: focusContext.disableFocus,
		focusNext: focusContext.focusNext,
		focusPrevious: focusContext.focusPrevious,
		focus: focusContext.focus,
	}
}

