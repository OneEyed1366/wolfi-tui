import React from 'react'
import { render, Box, Text } from '@wolfie/react'
import './styles/global.css'
import './styles/components.scss'
import './styles/tailwind.css'
import buttonStyles from './styles/Button.module.css'
import cardStyles from './styles/Card.module.css'

const App = () => {
	return (
		<Box className="p-1 flex-col" width={80}>
			<Text className="text-xl font-bold text-base mb-1">
				Super-Hybrid Styling Demo
			</Text>

			<Box className="card mb-1" width="100%">
				<Text className="card-title">SCSS Nested Selector</Text>
				<Text className="text-muted">
					SCSS nesting (.card .title) + Tailwind
				</Text>
			</Box>

			<Box className={cardStyles.card + ' mb-1'} width="100%">
				<Text className={cardStyles.cardTitle}>CSS Module Component</Text>
				<Text className="text-muted">Scoped styles from Card.module.css</Text>
			</Box>

			<Box className="flex-row gap-2 mb-1" width="100%">
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

			<Box className="card compact p-1 mb-1 border-cyan-500" width="100%">
				<Text className="text-sm text-accent">
					Compound: .card.compact + Tailwind
				</Text>
			</Box>

			<Box className="bg-[magenta].border-[cyan] p-1 mb-1" width="100%">
				<Text className="text-base font-bold">
					Complex: .bg-\[magenta\].border-\[cyan\]
				</Text>
			</Box>

			<Box className="p-1 border-yellow-500 border-double" width="100%">
				<Text className="text-[cyan]">Tailwind Arbitrary: text-[cyan]</Text>
			</Box>
		</Box>
	)
}

render(<App />)
