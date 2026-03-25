import React from 'react'
import { Box, Text, render } from '@wolf-tui/react'

function Clear() {
	return (
		<Box style={{ flexDirection: 'column' }}>
			<Text>A</Text>
			<Text>B</Text>
			<Text>C</Text>
		</Box>
	)
}

const { clear } = render(<Clear />)
clear()
