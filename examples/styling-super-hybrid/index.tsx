import React from 'react'
import { render, Box, Text } from '@wolfie/react'
import './styles/global.css'
import './styles/components.scss'
import './styles/tailwind.css'
import buttonStyles from './styles/Button.module.css'
import cardStyles from './styles/Card.module.css'

const App = () => {
	return (
		<Box className="p-4 flex-col gap-3">
			<Box className="mb-2 flex-col gap-2">
				<Text className="text-xl font-bold text-base">
					Super-Hybrid Styling Demo
				</Text>

				<Box className="card">
					<Text className="card-title">SCSS Nested Selector</Text>
					<Text className="text-muted">
						This card uses SCSS nesting (.card .title) + Tailwind utilities
					</Text>
				</Box>

				<Box className={cardStyles.card}>
					<Text className={cardStyles.cardTitle}>CSS Module Component</Text>
					<Text className="text-muted">
						Scoped styles from Card.module.css + Tailwind gap utilities
					</Text>
				</Box>

				<Box className="mb-2 flex-row gap-2">
					<Box className="btn primary">
						<Text>Primary Button</Text>
					</Box>

					<Box className="btn large">
						<Text>Large Button</Text>
					</Box>

					<Box className={buttonStyles.button}>
						<Text className={buttonStyles.text}>Module Button</Text>
					</Box>
				</Box>

				<Box className="card compact p-2 border-cyan-500">
					<Text className="text-sm text-accent">
						Compound Selector: .card.compact + Tailwind utilities
					</Text>
				</Box>

				<Box className="p-3 flex-row items-center gap-2">
					<Text className="text-base font-bold">
						All 4 approaches working together:
					</Text>
					<Text className="text-green-400">Tailwind</Text>
					<Text>+</Text>
					<Text className="text-cyan-400">SCSS</Text>
					<Text>+</Text>
					<Text className="text-yellow-400">Global CSS</Text>
					<Text>+</Text>
					<Text className="text-magenta-400">CSS Modules</Text>
				</Box>
			</Box>
		</Box>
	)
}

render(<App />)
