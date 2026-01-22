import React from 'react'
import { render, Box, Text } from '@wolfie/react'
import './styles.css'

const App = () => {
	return (
		<Box className="p-4 flex-col gap-2 border border-blue-500">
			<Text className="text-xl font-bold text-cyan-400">
				Tailwind CSS in TUI
			</Text>

			<Box className="mt-2 p-2 bg-gray-800 rounded">
				<Text className="text-gray-300">
					This example uses Tailwind CSS v4 (with shim) & CSS-first config.
				</Text>
			</Box>

			<Box className="flex-row gap-4 mt-2">
				<Box className="bg-red-900 p-1 px-3 border border-red-500">
					<Text className="text-red-200">Red Box</Text>
				</Box>
				<Box className="bg-green-900 p-1 px-3 border border-green-500">
					<Text className="text-green-200">Green Box</Text>
				</Box>
				<Box className="bg-blue-900 p-1 px-3 border border-blue-500">
					<Text className="text-blue-200 underline" style={{ underline: true } style={{ underline: true, underline: true }}>Blue Link</Text>
				</Box>
			</Box>

			<Box className="mt-4 p-2 border border-yellow-600 flex-col">
				<Text className="text-yellow-500 font-bold">New Features:</Text>
				<Text className="text-white">- Scaled units (1rem = 4 cells)</Text>
				<Text className="text-white">
					- RGB color parsing with nested variables
				</Text>
				<Text className="text-white">- Underline support via className</Text>
				<Text className="text-white">- Italic support via className</Text>
				<Text className="text-modern-red font-bold">
					- Modern Color (OKLCH) support!
				</Text>
			</Box>
		</Box>
	)
}

render(<App />)
