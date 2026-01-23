import React from 'react'
import { Box, Text } from '@wolfie/react'
import './styles.css'

export const App = () => (
	<Box className="container p-4">
		<Text className="title m-1">Hello from esbuild + Tailwind v4!</Text>
		<Box className="m-2 p-1 red-bg">
			<Text>This style was inlined at build time using TWv4.</Text>
		</Box>
	</Box>
)
