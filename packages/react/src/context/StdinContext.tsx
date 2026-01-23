import { EventEmitter } from 'node:events'
import process from 'node:process'
import { createContext } from 'react'

export type IProps = {
	/**
	The stdin stream passed to `render()` in `options.stdin`, or `process.stdin` by default. Useful if your app needs to handle user input.
	*/
	stdin: NodeJS.ReadStream

	/**
	Wolfie exposes this function via own `<StdinContext>` to be able to handle Ctrl+C, that's why you should use Wolfie's `setRawMode` instead of `process.stdin.setRawMode`. If the `stdin` stream passed to Wolfie does not support setRawMode, this function does nothing.
	*/
	setRawMode: (value: boolean) => void

	/**
	A boolean flag determining if the current `stdin` supports `setRawMode`. A component using `setRawMode` might want to use `isRawModeSupported` to nicely fall back in environments where raw mode is not supported.
	*/
	isRawModeSupported: boolean

	internal_exitOnCtrlC: boolean

	internal_eventEmitter: EventEmitter
}

/**
`StdinContext` is a React context that exposes the input stream.
*/
export const StdinContext = createContext<IProps>({
	stdin: process.stdin,
	internal_eventEmitter: new EventEmitter(),
	setRawMode() {},
	isRawModeSupported: false,
	internal_exitOnCtrlC: true,
})

StdinContext.displayName = 'InternalStdinContext'

