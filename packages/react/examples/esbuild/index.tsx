import React from 'react'
import { render, Box, Text } from '@wolfie/react'
import './styles/global.css'
import './styles/components.scss'
import './styles/styles.less'
import './styles/styles.styl'
import './styles/tailwind.css'
import buttonStyles from './styles/Button.module.css'
import cardStyles from './styles/Card.module.css'

/*
 * Demo
 *
 * This example demonstrates all supported styling flavors in Wolfie:
 * - Tailwind JIT utilities (flex-col, p-1, w-full, etc.)
 * - SCSS with nesting & imports
 * - LESS with nesting
 * - Stylus with indentation
 * - CSS Modules (.module.css)
 * - Global CSS
 *
 * All flavors are combined in a single application to show compatibility.
 */

const App = () => {
	return (
		<Box className="p-1 flex-col w-[80]">
			<Box className="mb-1">
				<Text className="text-white font-bold">Wolfie Super-Hybrid Demo</Text>
			</Box>

			{/* Tailwind Section */}
			<Box className="border-double border-yellow p-1 mb-1 flex-col w-full">
				<Text className="text-[cyan]">
					Tailwind: border-double + arbitrary text-[cyan]
				</Text>
			</Box>

			{/* SCSS Section */}
			<Box className="card flex-col mb-1 w-full">
				<Text className="card-title">SCSS Flavor</Text>
				<Text className="text-muted">
					Nested selectors (.card .card-title) from SCSS
				</Text>
			</Box>

			{/* LESS Section */}
			<Box className="less-box flex-col mb-1 w-full">
				<Text className="less-text">LESS Flavor</Text>
				<Text className="text-muted">
					Nesting from LESS (.less-box .less-text)
				</Text>
			</Box>

			{/* Stylus Section */}
			<Box className="stylus-box flex-col mb-1 w-full">
				<Text className="stylus-text">Stylus Flavor</Text>
				<Text className="text-muted">Indentation-based styles from Stylus</Text>
			</Box>

			{/* CSS Modules Section */}
			<Box className={[cardStyles.card, 'flex-col mb-1 w-full']}>
				<Text className={cardStyles.cardTitle}>CSS Modules Flavor</Text>
				<Text className="text-muted">Scoped styles from Card.module.css</Text>
			</Box>

			{/* Buttons Mix */}
			<Box className="flex-row gap-2 mb-1 w-full">
				<Box className="btn primary">
					<Text>SCSS Btn</Text>
				</Box>
				<Box className={buttonStyles.button}>
					<Text className={buttonStyles.text}>Module Btn</Text>
				</Box>
				<Box className="bg-blue-600 p-x-2">
					<Text className="text-white">Tailwind Btn</Text>
				</Box>
			</Box>
		</Box>
	)
}

render(<App />)
