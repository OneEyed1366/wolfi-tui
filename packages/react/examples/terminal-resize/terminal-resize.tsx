import React, { useState } from 'react'
import render from '../../src/render'
import { Box, Text, useInput } from '../../src/index'

function TerminalResizeTest() {
	const [value, setValue] = useState('')

	useInput((input) => {
		if (input === '\r') {
			// Enter key - clear input
			setValue('')
		} else if (input === '\u007F' || input === '\b') {
			// Backspace
			setValue((previous) => previous.slice(0, -1))
		} else {
			// Regular character
			setValue((previous) => previous + input)
		}
	})

	return (
		<Box style={{ flexDirection: 'column', padding: 1 }}>
			<Text style={{ color: 'cyan', fontWeight: 'bold' }}>
				=== Terminal Resize Test ===
			</Text>
			<Text>
				Type something and then resize your terminal (drag the edge or press
				Cmd/Ctrl -/+)
			</Text>
			<Text>Input: "{value}"</Text>
			<Box style={{ marginTop: 1 }}>
				<Text style={{ color: 'gray' }}>Press Ctrl+C to exit</Text>
			</Box>
		</Box>
	)
}

render(<TerminalResizeTest />, {
	patchConsole: true,
	exitOnCtrlC: true,
})
