import { useState } from 'react'
import render from '../../src/render'
import { Box, Text, EmailInput, useApp } from '../../src/index'

function EmailInputDemo() {
	const { exit } = useApp()
	const [currentValue, setCurrentValue] = useState('')
	const [submitted, setSubmitted] = useState<string | null>(null)

	if (submitted !== null) {
		return (
			<Box style={{ flexDirection: 'column', padding: 1 }}>
				<Text style={{ color: 'cyan' }}>Email Input Demo - Submitted</Text>
				<Box style={{ marginTop: 1 }}>
					<Text>
						Email: <Text style={{ color: 'green' }}>{submitted}</Text>
					</Text>
				</Box>
			</Box>
		)
	}

	return (
		<Box style={{ flexDirection: 'column', padding: 1 }}>
			<Text style={{ color: 'cyan' }}>Email Input Demo</Text>
			<Text style={{ color: 'gray' }}>Type email, use Tab for domain autocomplete</Text>

			<Box style={{ marginTop: 1, flexDirection: 'column', gap: 1 }}>
				<Box style={{ gap: 1 }}>
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

				<Text style={{ color: 'gray' }}>Current: {currentValue || '(empty)'}</Text>
			</Box>
		</Box>
	)
}

render(<EmailInputDemo />)
