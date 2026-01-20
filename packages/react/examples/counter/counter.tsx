import React from 'react'
import render from '../../src/render'
import { Text } from '../../src/index'

function Counter() {
	const [counter, setCounter] = React.useState(0)

	React.useEffect(() => {
		const timer = setInterval(() => {
			setCounter((prevCounter) => prevCounter + 1)
		}, 100)

		return () => {
			clearInterval(timer)
		}
	}, [])

	return <Text color="green">{counter} tests passed</Text>
}

render(<Counter />)
