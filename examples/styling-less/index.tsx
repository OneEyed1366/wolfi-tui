import React from 'react'
import { render, Box, Text } from '@wolfie/react'
import styles from './styles.less'

const App = () => {
	return (
		<Box className={styles.box} flexDirection="column">
			<Text className={styles.nested}>Hello from Less!</Text>
		</Box>
	)
}

render(<App />)
