import React from 'react'
import { render, Box, Text } from '@wolfie/react'
import './global.css'
import buttonStyles from './Button.module.css'

const App = () => {
	return (
		<Box className="layout" style={{ flexDirection: 'column', gap: 1 }}>
			<Text>This example mixes Global CSS and CSS Modules.</Text>
			<Box className={buttonStyles.button}>
				<Text className={buttonStyles.text}>Module Styled Button</Text>
			</Box>
		</Box>
	)
}

render(<App />)
