import React from 'react'
import { render, Box, Text } from '@wolfie/react'
import './styles/global.css'
import './styles/components.scss'
import './styles/tailwind.css'
import buttonStyles from './styles/Button.module.css'
import cardStyles from './styles/Card.module.css'

const App = () => {
	return (
		<Box padding={1} flexDirection="column" width={80}>
			<Box marginBottom={1}>
				<Text color="white" bold>
					Super-Hybrid Styling Demo
				</Text>
			</Box>

			<Box
				className="card"
				width="100%"
				flexDirection="column"
				marginBottom={1}
			>
				<Text className="card-title">SCSS Nested Selector</Text>
				<Text className="text-muted">
					SCSS nesting (.card .title) + Tailwind
				</Text>
			</Box>

			<Box
				className={cardStyles.card}
				width="100%"
				flexDirection="column"
				marginBottom={1}
			>
				<Text className={cardStyles.cardTitle}>CSS Module Component</Text>
				<Text className="text-muted">Scoped styles from Card.module.css</Text>
			</Box>

			<Box flexDirection="row" gap={2} marginBottom={1} width="100%">
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

			<Box
				className="card compact border-cyan-500"
				width="100%"
				flexDirection="column"
				padding={1}
				marginBottom={1}
			>
				<Text className="text-sm text-accent">
					Compound: .card.compact + Tailwind
				</Text>
			</Box>

			<Box
				className="bg-[magenta].border-[cyan]"
				width="100%"
				flexDirection="column"
				padding={1}
				marginBottom={1}
			>
				<Text color="white" bold>
					Complex: .bg-\[magenta\].border-\[cyan\]
				</Text>
			</Box>

			<Box
				borderStyle="round"
				borderColor="yellow"
				width="100%"
				padding={1}
				flexDirection="column"
			>
				<Text color="cyan">Tailwind Arbitrary: text-[cyan]</Text>
			</Box>
		</Box>
	)
}

render(<App />)
