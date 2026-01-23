import process from 'node:process'
import { createContext } from 'react'

export type IProps = {
	/**
	Stdout stream passed to `render()` in `options.stdout` or `process.stdout` by default.
	*/
	stdout: NodeJS.WriteStream

	/**
	Write any string to stdout while preserving Wolfie's output. It's useful when you want to display external information outside of Wolfie's rendering and ensure there's no conflict between two. It's similar to `<Static>`, except it can't accept components; it only works with strings.
	*/
	write: (data: string) => void
}

/**
`StdoutContext` is a React context that exposes the stdout stream where Wolfie renders your app.
*/
export const StdoutContext = createContext<IProps>({
	stdout: process.stdout,
	write() {},
})

StdoutContext.displayName = 'InternalStdoutContext'
