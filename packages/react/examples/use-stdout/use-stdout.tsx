import React from 'react'
import render from '../../src/render'
import { Box, Text, useStdout } from '../../src/index'

function Example() {
	const { stdout, write } = useStdout()

	React.useEffect(() => {
		const timer = setInterval(() => {
			write('Hello from Ink to stdout\n')
		}, 1000)

		return () => {
			clearInterval(timer)
		}
	}, [])

	return (
		<Box style={{ flexDirection: 'column', paddingX: 2, paddingY: 1 }}>
			<Text style={{ fontWeight: 'bold', underline: true }}>
				Terminal dimensions:
			</Text>

			<Box style={{ marginTop: 1 }}>
				<Text>
					Width: <Text style={{ fontWeight: 'bold' }}>{stdout.columns}</Text>
				</Text>
			</Box>
			<Box>
				<Text>
					Height: <Text style={{ fontWeight: 'bold' }}>{stdout.rows}</Text>
				</Text>
			</Box>
		</Box>
	)
}

render(<Example />)
