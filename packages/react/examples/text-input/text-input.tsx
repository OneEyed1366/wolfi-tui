import { useState } from 'react'
import render from '../../src/render'
import { Box, Text, TextInput, useApp } from '../../src/index'

function TextInputDemo() {
	const { exit } = useApp()
	const [currentValue, setCurrentValue] = useState('')
	const [submitted, setSubmitted] = useState<string | null>(null)

	if (submitted !== null) {
		return (
			<Box style={{ flexDirection: 'column', padding: 1 }}>
				<Text style={{ color: 'cyan' }}>Text Input Demo - Submitted</Text>
				<Box style={{ marginTop: 1 }}>
					<Text>
						You entered: <Text style={{ color: 'green' }}>{submitted || '(empty)'}</Text>
					</Text>
				</Box>
			</Box>
		)
	}

	return (
		<Box style={{ flexDirection: 'column', padding: 1 }}>
			<Text style={{ color: 'cyan' }}>Text Input Demo</Text>
			<Text style={{ color: 'gray' }}>
				Type your name, use Tab for suggestions, Enter to submit
			</Text>

			<Box style={{ marginTop: 1, flexDirection: 'column', gap: 1 }}>
				<Box style={{ gap: 1 }}>
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

				<Text style={{ color: 'gray' }}>Current value: {currentValue || '(empty)'}</Text>
			</Box>
		</Box>
	)
}

render(<TextInputDemo />)
