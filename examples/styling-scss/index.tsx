import React from 'react'
import { render, Box, Text } from '@wolfie/react'
import './styles.css'
import './theme.scss'

const App = () => {
	return (
		<Box className="base card" flexDirection="column">
			<Text className="title">SCSS Example</Text>
			<Text>This styles come from a mix of CSS and SCSS.</Text>
		</Box>
	)
}

render(<App />)
