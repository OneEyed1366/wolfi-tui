import render from '../../src/render'
import { Box, Text, Alert } from '../../src/index'

function Demo() {
	return (
		<Box style={{ flexDirection: 'column', padding: 1, gap: 1 }}>
			<Text style={{ fontWeight: 'bold' }}>Alert Component Demo</Text>

			<Box style={{ flexDirection: 'column', gap: 1 }}>
				<Alert variant="info" title="Information">
					This is an informational alert message. It provides helpful context.
				</Alert>

				<Alert variant="success" title="Success">
					Operation completed successfully! Your changes have been saved.
				</Alert>

				<Alert variant="warning" title="Warning">
					Please review your input. Some values may need attention.
				</Alert>

				<Alert variant="error" title="Error">
					An error occurred while processing your request. Please try again.
				</Alert>

				<Alert variant="info">
					Alert without a title - just the message content.
				</Alert>
			</Box>
		</Box>
	)
}

render(<Demo />)
