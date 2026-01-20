import render from '../../src/render'
import { Box, Text, StatusMessage } from '../../src/index'

function Demo() {
	return (
		<Box flexDirection="column" padding={1} gap={1}>
			<Text bold>StatusMessage Component Demo</Text>

			<Box flexDirection="column" gap={1}>
				<StatusMessage variant="info">
					Fetching data from the server...
				</StatusMessage>

				<StatusMessage variant="success">
					All tests passed successfully
				</StatusMessage>

				<StatusMessage variant="warning">
					Configuration file is using deprecated options
				</StatusMessage>

				<StatusMessage variant="error">
					Failed to connect to database
				</StatusMessage>
			</Box>
		</Box>
	)
}

render(<Demo />)
