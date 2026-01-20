import React from 'react'
import { render, Box, Text } from '@wolfie/react'
import styles from './styles.styl'

const App = () => {
	return (
		<Box className={styles.stylusBox} flexDirection="column">
			<Text className={styles.content}>Hello from Stylus!</Text>
		</Box>
	)
}

render(<App />)
