import React, { useState } from 'react'
import { render, Box, Text, useInput, useApp } from '@wolfie/react'

const InteractiveApp = () => {
	const [count, setCount] = useState(0)
	const [input, setInput] = useState('')
	const [color, setColor] = useState('cyan')
	const { exit } = useApp()

	useInput((inputStr, key) => {
		if (key.escape) {
			exit()
		}

		if (key.upArrow) {
			setCount((c) => c + 1)
			setColor('green')
		}

		if (key.downArrow) {
			setCount((c) => c - 1)
			setColor('red')
		}

		if (inputStr && !key.return && !key.backspace && !key.delete) {
			setInput((i) => i + inputStr)
		}

		if (key.backspace || key.delete) {
			setInput((i) => i.slice(0, -1))
		}

		if (key.return) {
			setInput('')
			setColor('yellow')
		}
	})

	return (
		<Box
			style={{
				flexDirection: 'column',
				padding: 1,
				borderStyle: 'round',
				borderColor: color,
				width: 60,
			}}
		>
			<Box style={{ marginBottom: 1 }}>
				<Text style={{ bold: true, color: 'magenta' }}>
					Wolfie Interactive Test
				</Text>
			</Box>

			<Box style={{ flexDirection: 'row', marginBottom: 1 }}>
				<Text>Counter: </Text>
				<Text style={{ color: count >= 0 ? 'green' : 'red' }}>{count}</Text>
				<Text style={{ dimColor: true }}> (Use Up/Down arrows)</Text>
			</Box>

			<Box style={{ flexDirection: 'row', marginBottom: 1 }}>
				<Text>Input: </Text>
				<Text style={{ color: 'white', backgroundColor: 'blue' }}>
					{input || 'Type something...'}
				</Text>
			</Box>

			<Box style={{ flexDirection: 'column', marginTop: 1 }}>
				<Text style={{ dimColor: true }}>Controls:</Text>
				<Text style={{ dimColor: true }}>• Arrow Up/Down: Change counter</Text>
				<Text style={{ dimColor: true }}>• Enter: Clear input</Text>
				<Text style={{ dimColor: true }}>• Escape: Exit</Text>
			</Box>
		</Box>
	)
}

render(<InteractiveApp />)
