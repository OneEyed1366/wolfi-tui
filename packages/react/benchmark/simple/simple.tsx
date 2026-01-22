import React from 'react'
import { render, Box, Text } from '../../src/index'

function App() {
	return (
		<Box style={{ flexDirection: 'column', padding: 1 }}>
			<Text style={{ color: 'red', underline: true, fontWeight: 'bold' }}>
				{}
				{'Hello World'}
			</Text>

			<Box style={{ marginTop: 1, width: 60 }}>
				<Text>
					Cupcake ipsum dolor sit amet candy candy. Sesame snaps cookie I love
					tootsie roll apple pie bonbon wafer. Caramels sesame snaps icing
					cotton candy I love cookie sweet roll. I love bonbon sweet.
				</Text>
			</Box>

			<Box style={{ marginTop: 1, flexDirection: 'column' }}>
				<Text style={{ backgroundColor: 'white', color: 'black' }}>
					Colors:
				</Text>

				<Box style={{ flexDirection: 'column', paddingLeft: 1 }}>
					<Text>
						- <Text style={{ color: 'red' }}>Red</Text>
					</Text>
					<Text>
						- <Text style={{ color: 'blue' }}>Blue</Text>
					</Text>
					<Text>
						- <Text style={{ color: 'green' }}>Green</Text>
					</Text>
				</Box>
			</Box>
		</Box>
	)
}

const { rerender } = render(<App />)

for (let index = 0; index < 100_000; index++) {
	rerender(<App />)
}
