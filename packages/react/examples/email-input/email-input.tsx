import { useState } from 'react'
import { render, Box, Text, EmailInput, useApp } from '../../src/index'

function EmailInputDemo() {
	const { exit } = useApp()
	const [currentValue, setCurrentValue] = useState('')
	const [submitted, setSubmitted] = useState<string | null>(null)

	if (submitted !== null) {
		return (
			<Box flexDirection="column" padding={1}>
				<Text color="cyan">Email Input Demo - Submitted</Text>
				<Box marginTop={1}>
					<Text>
						Email: <Text color="green">{submitted}</Text>
					</Text>
				</Box>
			</Box>
		)
	}

	return (
		<Box flexDirection="column" padding={1}>
			<Text color="cyan">Email Input Demo</Text>
			<Text dimColor>Type email, use Tab for domain autocomplete</Text>

			<Box marginTop={1} flexDirection="column" gap={1}>
				<Box gap={1}>
					<Text>Email:</Text>
					<EmailInput
						placeholder="user@example.com"
						domains={['gmail.com', 'yahoo.com', 'outlook.com', 'proton.me']}
						onChange={setCurrentValue}
						onSubmit={(value) => {
							setSubmitted(value)
							setTimeout(() => exit(), 1500)
						}}
					/>
				</Box>

				<Text dimColor>Current: {currentValue || '(empty)'}</Text>
			</Box>
		</Box>
	)
}

render(<EmailInputDemo />)
