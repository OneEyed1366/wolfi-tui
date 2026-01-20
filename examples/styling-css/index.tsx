import React from 'react'
import { render, Box, Text } from '@wolfie/react'
import './styles.css'

const App = () => {
	return (
		<Box className="container" flexDirection="column">
			<Text className="title">CSS Only</Text>
			<Box marginTop={1}>
				<Text className="description">
					This example demonstrates using standard CSS files with global class
					names, transformed on-the-fly.
				</Text>
			</Box>
		</Box>
	)
}

render(<App />)
