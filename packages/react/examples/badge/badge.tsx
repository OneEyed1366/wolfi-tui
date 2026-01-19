import { render, Box, Text, Badge } from '../../src/index'

function Demo() {
	return (
		<Box flexDirection="column" padding={1} gap={1}>
			<Text bold>Badge Component Demo</Text>

			<Box flexDirection="column" gap={1}>
				<Box gap={1}>
					<Text>Default (magenta):</Text>
					<Badge>new</Badge>
				</Box>

				<Box gap={1}>
					<Text>Green badge:</Text>
					<Badge color="green">success</Badge>
				</Box>

				<Box gap={1}>
					<Text>Blue badge:</Text>
					<Badge color="blue">info</Badge>
				</Box>

				<Box gap={1}>
					<Text>Yellow badge:</Text>
					<Badge color="yellow">warning</Badge>
				</Box>

				<Box gap={1}>
					<Text>Red badge:</Text>
					<Badge color="red">error</Badge>
				</Box>

				<Box gap={1}>
					<Text>Cyan badge:</Text>
					<Badge color="cyan">beta</Badge>
				</Box>
			</Box>
		</Box>
	)
}

render(<Demo />)
