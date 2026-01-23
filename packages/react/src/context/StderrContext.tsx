import process from 'node:process'
import { createContext } from 'react'

export type IProps = {
	/**
	Stderr stream passed to `render()` in `options.stderr` or `process.stderr` by default.
	*/
	stderr: NodeJS.WriteStream

	/**
	Write any string to stderr while preserving Wolfie's output. It's useful when you want to display external information outside of Wolfie's rendering and ensure there's no conflict between two. It's similar to `<Static>`, except it can't accept components; it only works with strings.
	*/
	write: (data: string) => void
}

/**
`StderrContext` is a React context that exposes the stderr stream.
*/
export const StderrContext = createContext<IProps>({
	stderr: process.stderr,
	write() {},
})

StderrContext.displayName = 'InternalStderrContext'

