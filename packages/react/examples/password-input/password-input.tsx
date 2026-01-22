import { useState } from 'react'
import render from '../../src/render'
import { Box, Text, PasswordInput, useApp } from '../../src/index'

function PasswordInputDemo() {
	const { exit } = useApp()
	const [charCount, setCharCount] = useState(0)
	const [submitted, setSubmitted] = useState(false)

	if (submitted) {
		return (
			<Box style={{ flexDirection: 'column', padding: 1 }}>
				<Text style={{ color: 'cyan' }}>Password Input Demo - Complete</Text>
				<Box style={{ marginTop: 1 }}>
					<Text style={{ color: 'green' }}>Password accepted ({charCount} characters)</Text>
				</Box>
			</Box>
		)
	}

	return (
		<Box style={{ flexDirection: 'column', padding: 1 }}>
			<Text style={{ color: 'cyan' }}>Password Input Demo</Text>
			<Text style={{ color: 'gray' }}>Type your password (characters are masked)</Text>

			<Box style={{ marginTop: 1, flexDirection: 'column', gap: 1 }}>
				<Box style={{ gap: 1 }}>
					<Text>Password:</Text>
					<PasswordInput
						placeholder="Enter password..."
						onChange={(value) => setCharCount(value.length)}
						onSubmit={() => {
							setSubmitted(true)
							setTimeout(() => exit(), 1500)
						}}
					/>
				</Box>

				<Text style={{ color: 'gray' }}>Characters entered: {charCount}</Text>
			</Box>
		</Box>
	)
}

render(<PasswordInputDemo />)
