import { useState } from 'react'
import render from '../../src/render'
import { Box, Text, ConfirmInput, useApp } from '../../src/index'

function ConfirmInputDemo() {
	const { exit } = useApp()
	const [result, setResult] = useState<'confirmed' | 'cancelled' | null>(null)

	if (result) {
		return (
			<Box style={{ flexDirection: 'column', padding: 1 }}>
				<Text style={{ color: 'cyan' }}>Confirm Input Demo - Result</Text>
				<Box style={{ marginTop: 1 }}>
					<Text>
						You {result === 'confirmed' ? '✓ confirmed' : '✗ cancelled'} the
						action.
					</Text>
				</Box>
			</Box>
		)
	}

	return (
		<Box style={{ flexDirection: 'column', padding: 1 }}>
			<Text style={{ color: 'cyan' }}>Confirm Input Demo</Text>
			<Text style={{ color: 'gray' }}>
				Press Y to confirm, N to cancel, or Enter for default
			</Text>

			<Box style={{ marginTop: 1, gap: 1 }}>
				<Text>Do you want to proceed?</Text>
				<ConfirmInput
					defaultChoice="confirm"
					onConfirm={() => {
						setResult('confirmed')
						setTimeout(() => exit(), 1000)
					}}
					onCancel={() => {
						setResult('cancelled')
						setTimeout(() => exit(), 1000)
					}}
				/>
			</Box>
		</Box>
	)
}

render(<ConfirmInputDemo />)
