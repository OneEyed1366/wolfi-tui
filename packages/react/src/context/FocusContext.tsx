import { createContext } from 'react'

export type IProps = {
	activeId?: string
	add: (id: string, options: { autoFocus: boolean }) => void
	remove: (id: string) => void
	activate: (id: string) => void
	deactivate: (id: string) => void
	enableFocus: () => void
	disableFocus: () => void
	focusNext: () => void
	focusPrevious: () => void
	focus: (id: string) => void
}

export const FocusContext = createContext<IProps>({
	activeId: undefined,
	add() {},
	remove() {},
	activate() {},
	deactivate() {},
	enableFocus() {},
	disableFocus() {},
	focusNext() {},
	focusPrevious() {},
	focus() {},
})

FocusContext.displayName = 'InternalFocusContext'
