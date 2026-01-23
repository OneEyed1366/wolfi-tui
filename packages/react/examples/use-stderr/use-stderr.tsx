import React from 'react'
import render from '../../src/render'
import { Text, useStderr } from '../../src/index'

function Example() {
	const { write } = useStderr()

	React.useEffect(() => {
		const timer = setInterval(() => {
			write('Hello from Wolfie to stderr\n')
		}, 1000)

		return () => {
			clearInterval(timer)
		}
	}, [])

	return <Text>Hello World</Text>
}

render(<Example />)
