import React from 'react'
import { render, Box, Text } from '@wolfie/react'
import './styles/global.css'
import './styles/components.scss'
import './styles/tailwind.css'
import buttonStyles from './styles/Button.module.css'
import cardStyles from './styles/Card.module.css'

/*
 * Hybrid CSS Styling Demo
 *
 * This example demonstrates all CSS approaches without explicit layout props:
 * - SCSS with nesting (.card, .btn)
 * - CSS Modules (Button.module.css, Card.module.css)
 * - Global CSS (global.css)
 * - Tailwind JIT utilities (flex-col, p-1, w-full, etc.)
 *
 * Box defaults apply but are fully overridable by className styles.
 */

const App = () => {
	return (
		<Box className="p-1 flex-col w-[80]">
			<Box className="mb-1">
				<Text className="text-white font-bold">Super-Hybrid Styling Demo</Text>
			</Box>

			<Box className="card flex-col mb-1 w-full">
				<Text className="card-title">SCSS Nested Selector</Text>
				<Text className="text-muted">
					SCSS nesting (.card .title) + Tailwind
				</Text>
			</Box>

			<Box className={[cardStyles.card, 'flex-col mb-1 w-full']}>
				<Text className={cardStyles.cardTitle}>CSS Module Component</Text>
				<Text className="text-muted">CSS Module styles working!</Text>
			</Box>

			<Box className="flex-row gap-2 mb-1 w-full">
				<Box className="btn primary">
					<Text>Primary</Text>
				</Box>
				<Box className="btn">
					<Text>Standard</Text>
				</Box>
				<Box className={buttonStyles.button}>
					<Text className={buttonStyles.text}>Module</Text>
				</Box>
			</Box>

			<Box className="card compact border-cyan-500 flex-col p-1 mb-1 w-full">
				<Text className="text-sm text-accent">
					Compound: .card.compact + Tailwind
				</Text>
			</Box>

			<Box className="bg-[magenta].border-[cyan] flex-col p-1 mb-1 w-full">
				<Text className="text-white font-bold">
					Complex: .bg-\[magenta\].border-\[cyan\]
				</Text>
			</Box>

			<Box className="border-double border-yellow p-1 flex-col w-full">
				<Text className="text-[cyan]">Tailwind Arbitrary: text-[cyan]</Text>
			</Box>
		</Box>
	)
}

render(<App />)
