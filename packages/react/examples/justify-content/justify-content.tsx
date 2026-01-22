import React from 'react'
import render from '../../src/render'
import { Box, Text } from '../../src/index'

function JustifyContent() {
	return (
		<Box style={{ flexDirection: 'column' }}>
			<Box>
				<Text>[</Text>
				<Box style={{ justifyContent: 'flex-start', width: 20, height: 1 }}>
					<Text>X</Text>
					<Text>Y</Text>
				</Box>
				<Text>] flex-start</Text>
			</Box>
			<Box>
				<Text>[</Text>
				<Box style={{ justifyContent: 'flex-end', width: 20, height: 1 }}>
					<Text>X</Text>
					<Text>Y</Text>
				</Box>
				<Text>] flex-end</Text>
			</Box>
			<Box>
				<Text>[</Text>
				<Box style={{ justifyContent: 'center', width: 20, height: 1 }}>
					<Text>X</Text>
					<Text>Y</Text>
				</Box>
				<Text>] center</Text>
			</Box>
			<Box>
				<Text>[</Text>
				<Box style={{ justifyContent: 'space-around', width: 20, height: 1 }}>
					<Text>X</Text>
					<Text>Y</Text>
				</Box>
				<Text>] space-around</Text>
			</Box>
			<Box>
				<Text>[</Text>
				<Box style={{ justifyContent: 'space-between', width: 20, height: 1 }}>
					<Text>X</Text>
					<Text>Y</Text>
				</Box>
				<Text>] space-between</Text>
			</Box>
			<Box>
				<Text>[</Text>
				<Box style={{ justifyContent: 'space-evenly', width: 20, height: 1 }}>
					<Text>X</Text>
					<Text>Y</Text>
				</Box>
				<Text>] space-evenly</Text>
			</Box>
		</Box>
	)
}

render(<JustifyContent />)
