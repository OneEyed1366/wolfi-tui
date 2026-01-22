import React from 'react'
import render from '../../src/render'
import { Box, Text } from '../../src/index'

function Borders() {
	return (
		<Box style={{ flexDirection: 'column', padding: 2 }}>
			<Box>
				<Box style={{ borderStyle: 'single', marginRight: 2 }}>
					<Text>single</Text>
				</Box>

				<Box style={{ borderStyle: 'double', marginRight: 2 }}>
					<Text>double</Text>
				</Box>

				<Box style={{ borderStyle: 'round', marginRight: 2 }}>
					<Text>round</Text>
				</Box>

				<Box style={{ borderStyle: 'bold' }}>
					<Text>bold</Text>
				</Box>
			</Box>

			<Box style={{ marginTop: 1 }}>
				<Box style={{ borderStyle: 'singleDouble', marginRight: 2 }}>
					<Text>singleDouble</Text>
				</Box>

				<Box style={{ borderStyle: 'doubleSingle', marginRight: 2 }}>
					<Text>doubleSingle</Text>
				</Box>

				<Box style={{ borderStyle: 'classic' }}>
					<Text>classic</Text>
				</Box>
			</Box>
		</Box>
	)
}

render(<Borders />)
