import { useState } from 'react'
import { render, Box, Text, PasswordInput, useApp } from '../../src/index'

function PasswordInputDemo() {
	const { exit } = useApp()
	const [charCount, setCharCount] = useState(0)
	const [submitted, setSubmitted] = useState(false)

	if (submitted) {
		return (
			<Box flexDirection="column" padding={1}>
				<Text color="cyan">Password Input Demo - Complete</Text>
				<Box marginTop={1}>
					<Text color="green">Password accepted ({charCount} characters)</Text>
				</Box>
			</Box>
		)
	}

	return (
		<Box flexDirection="column" padding={1}>
			<Text color="cyan">Password Input Demo</Text>
			<Text dimColor>Type your password (characters are masked)</Text>

			<Box marginTop={1} flexDirection="column" gap={1}>
				<Box gap={1}>
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

				<Text dimColor>Characters entered: {charCount}</Text>
			</Box>
		</Box>
	)
}

render(<PasswordInputDemo />)
