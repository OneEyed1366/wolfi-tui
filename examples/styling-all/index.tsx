import React from 'react'
import { render, Box, Text } from '@wolfie/react'
import './base.css'
import styles from './layout.module.scss'

const App = () => {
	return (
		<Box className={styles.container} style={{ flexDirection: 'column' }}>
			<Text className="title">Combined Example</Text>
			<Text className={styles.item}>SCSS Module Item 1</Text>
			<Text className={styles.item}>SCSS Module Item 2</Text>
		</Box>
	)
}

render(<App />)
