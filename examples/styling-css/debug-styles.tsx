import React from 'react';
import { render, Box, Text } from '@wolfie/react';

const testStyle = {
	borderStyle: "double" as const,
	borderColor: "yellow" as const,
	padding: 1
};

const App = () => {
	console.log("Test style:", JSON.stringify(testStyle, null, 2));
	return (
		<Box style={testStyle}>
			<Text>Test with explicit style object</Text>
		</Box>
	);
};

render(<App />);
