import { render, Box, Text, Spinner } from '../../src/index'

function Demo() {
	return (
		<Box flexDirection="column" padding={1} gap={1}>
			<Text bold>Spinner Component Demo</Text>

			<Box flexDirection="column" gap={1}>
				<Box gap={1}>
					<Text dimColor>Default (dots):</Text>
					<Spinner label="Loading..." />
				</Box>

				<Box gap={1}>
					<Text dimColor>Line spinner:</Text>
					<Spinner type="line" label="Processing..." />
				</Box>

				<Box gap={1}>
					<Text dimColor>Arc spinner:</Text>
					<Spinner type="arc" label="Please wait..." />
				</Box>

				<Box gap={1}>
					<Text dimColor>Bouncing bar:</Text>
					<Spinner type="bouncingBar" label="Working..." />
				</Box>

				<Box gap={1}>
					<Text dimColor>No label:</Text>
					<Spinner type="dots2" />
				</Box>
			</Box>
		</Box>
	)
}

render(<Demo />)
