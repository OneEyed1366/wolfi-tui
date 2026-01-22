import React from 'react'
import { Box, Text } from '../../src/index'

function BoxBackgrounds() {
	return (
		<Box style={{ flexDirection: 'column', gap: 1 }}>
			<Text style={{ fontWeight: 'bold' }}>Box Background Examples:</Text>

			<Box>
				<Text>1. Standard red background (10x3):</Text>
			</Box>
			<Box style={{ backgroundColor: 'red', width: 10, height: 3, alignSelf: 'flex-start' }}>
				<Text>Hello</Text>
			</Box>

			<Box>
				<Text>2. Blue background with border (12x4):</Text>
			</Box>
			<Box style={{ backgroundColor: 'blue', borderStyle: 'round', width: 12, height: 4, alignSelf: 'flex-start' }}>
				<Text>Border</Text>
			</Box>

			<Box>
				<Text>3. Green background with padding (14x4):</Text>
			</Box>
			<Box style={{ backgroundColor: 'green', padding: 1, width: 14, height: 4, alignSelf: 'flex-start' }}>
				<Text>Padding</Text>
			</Box>

			<Box>
				<Text>4. Yellow background with center alignment (16x3):</Text>
			</Box>
			<Box style={{ backgroundColor: 'yellow', width: 16, height: 3, justifyContent: 'center', alignSelf: 'flex-start' }}>
				<Text>Centered</Text>
			</Box>

			<Box>
				<Text>5. Magenta background, column layout (12x5):</Text>
			</Box>
			<Box style={{ backgroundColor: 'magenta', flexDirection: 'column', width: 12, height: 5, alignSelf: 'flex-start' }}>
				<Text>Line 1</Text>
				<Text>Line 2</Text>
			</Box>

			<Box>
				<Text>6. Hex color background #FF8800 (10x3):</Text>
			</Box>
			<Box style={{ backgroundColor: '#FF8800', width: 10, height: 3, alignSelf: 'flex-start' }}>
				<Text>Hex</Text>
			</Box>

			<Box>
				<Text>7. RGB background rgb(0,255,0) (10x3):</Text>
			</Box>
			<Box style={{ backgroundColor: 'rgb(0,255,0)', width: 10, height: 3, alignSelf: 'flex-start' }}>
				<Text>RGB</Text>
			</Box>

			<Box>
				<Text>8. Text inheritance test:</Text>
			</Box>
			<Box style={{ backgroundColor: 'cyan', alignSelf: 'flex-start' }}>
				<Text>Inherited </Text>
				<Text style={{ backgroundColor: 'red' }}>Override </Text>
				<Text>Back to inherited</Text>
			</Box>

			<Box>
				<Text>9. Nested background inheritance:</Text>
			</Box>
			<Box style={{ backgroundColor: 'blue', alignSelf: 'flex-start' }}>
				<Text>Outer: </Text>
				<Box style={{ backgroundColor: 'yellow' }}>
					<Text>Inner: </Text>
					<Text style={{ backgroundColor: 'red' }}>Deep</Text>
				</Box>
			</Box>

			<Box style={{ marginTop: 1 }}>
				<Text>Press Ctrl+C to exit</Text>
			</Box>
		</Box>
	)
}

export default BoxBackgrounds
