import { createContext } from 'react'

export type IProps = {
	/**
	Exit (unmount) whole Wolfie app.
	*/
	exit: (error?: Error) => void
}

/**
`AppContext` is a React context that exposes a method to manually exit app (unmount).
*/
export const AppContext = createContext<IProps>({
	exit() {},
})

AppContext.displayName = 'InternalAppContext'

