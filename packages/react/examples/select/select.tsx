import { useState } from 'react'
import { render, Box, Text, Select, type Option } from '../../src/index'

const colorOptions: Option[] = [
	{ label: 'Red', value: 'red' },
	{ label: 'Green', value: 'green' },
	{ label: 'Blue', value: 'blue' },
	{ label: 'Yellow', value: 'yellow' },
	{ label: 'Magenta', value: 'magenta' },
	{ label: 'Cyan', value: 'cyan' },
]

function SelectExample() {
	const [selectedColor, setSelectedColor] = useState<string | undefined>(
		undefined
	)

	const handleChange = (value: string) => {
		setSelectedColor(value)
	}

	return (
		<Box flexDirection="column" gap={1}>
			<Text bold>Select a color (use arrow keys, Enter to confirm):</Text>

			<Select
				options={colorOptions}
				defaultValue="blue"
				onChange={handleChange}
			/>

			{selectedColor && (
				<Box marginTop={1}>
					<Text>
						Selected: <Text color={selectedColor}>{selectedColor}</Text>
					</Text>
				</Box>
			)}

			<Box marginTop={1}>
				<Text dimColor>Press Ctrl+C to exit</Text>
			</Box>
		</Box>
	)
}

render(<SelectExample />)
