import { useEffect } from 'react'
import { parseInputData, type IKey } from '@wolfie/shared'
import reconciler from '../reconciler'
import { useStdin } from './use-stdin'

export type { IKey }

type IHandler = (input: string, key: IKey) => void

type IOptions = {
	/**
	Enable or disable capturing of user input. Useful when there are multiple `useInput` hooks used at once to avoid handling the same input several times.

	@default true
	*/
	isActive?: boolean
}

/**
This hook is used for handling user input. It's a more convenient alternative to using `StdinContext` and listening for `data` events. The callback you pass to `useInput` is called for each character when the user enters any input. However, if the user pastes text and it's more than one character, the callback will be called only once, and the whole string will be passed as `input`.

```
import {useInput} from 'ink';

const UserInput = () => {
  useInput((input, key) => {
    if (input === 'q') {
      // Exit program
    }

    if (key.leftArrow) {
      // Left arrow key pressed
    }
  });

  return …
};
```
*/
export const useInput = (inputHandler: IHandler, options: IOptions = {}) => {
	const { stdin, setRawMode, internal_exitOnCtrlC, internal_eventEmitter } =
		useStdin()

	useEffect(() => {
		if (options.isActive === false) {
			return
		}

		setRawMode(true)

		return () => {
			setRawMode(false)
		}
	}, [options.isActive, setRawMode])

	useEffect(() => {
		if (options.isActive === false) {
			return
		}

		const handleData = (data: string) => {
			const { input, key } = parseInputData(data)

			// If app is not supposed to exit on Ctrl+C, then let input listener handle it
			if (!(input === 'c' && key.ctrl) || !internal_exitOnCtrlC) {
				// @ts-expect-error TypeScript types for `batchedUpdates` require an argument, but React's codebase doesn't provide it and it works without it as expected.
				reconciler.batchedUpdates(() => {
					inputHandler(input, key)
				})
			}
		}

		internal_eventEmitter?.on('input', handleData)

		return () => {
			internal_eventEmitter?.removeListener('input', handleData)
		}
	}, [options.isActive, stdin, internal_exitOnCtrlC, inputHandler])
}
