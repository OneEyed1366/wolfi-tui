import { useState } from 'react'
import { render, Box, Text, TextInput, useApp } from '../../src/index.js'

function TextInputDemo() {
	const { exit } = useApp()
	const [currentValue, setCurrentValue] = useState('')
	const [submitted, setSubmitted] = useState<string | null>(null)

	if (submitted !== null) {
		return (
			<Box flexDirection="column" padding={1}>
				<Text color="cyan">Text Input Demo - Submitted</Text>
				<Box marginTop={1}>
					<Text>
						You entered: <Text color="green">{submitted || '(empty)'}</Text>
					</Text>
				</Box>
			</Box>
		)
	}

	return (
		<Box flexDirection="column" padding={1}>
			<Text color="cyan">Text Input Demo</Text>
			<Text dimColor>
				Type your name, use Tab for suggestions, Enter to submit
			</Text>

			<Box marginTop={1} flexDirection="column" gap={1}>
				<Box gap={1}>
					<Text>Name:</Text>
					<TextInput
						placeholder="Enter your name..."
						suggestions={['Alice', 'Bob', 'Charlie', 'Diana', 'Edward']}
						onChange={setCurrentValue}
						onSubmit={(value) => {
							setSubmitted(value)
							setTimeout(() => exit(), 1500)
						}}
					/>
				</Box>

				<Text dimColor>
					Current value: {currentValue || '(empty)'}
				</Text>
			</Box>
		</Box>
	)
}

render(<TextInputDemo />)
