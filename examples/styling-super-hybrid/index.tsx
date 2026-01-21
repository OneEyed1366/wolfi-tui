import React from 'react'
import { render, Box, Text } from '@wolfie/react'
import './styles/global.css'
import './styles/components.scss'
import './styles/tailwind.css'
// Temporarily disabled CSS Modules due to class name generation issue
// import buttonStyles from './styles/Button.module.css'
// import cardStyles from './styles/Card.module.css'

/*
 * NOTE: This example currently uses explicit layout props (flexDirection, padding, margin)
 * to ensure stability while Tailwind JIT is being debugged.
 *
 * FUTURE REFACTOR: Remove explicit props and use pure CSS classes:
 * - Replace flexDirection="column" with className="flex-col"
 * - Replace flexDirection="row" with className="flex-row"
 * - Replace padding={1} with className="p-1"
 * - Replace marginBottom={1} with className="mb-1"
 *
 * This requires:
 * 1. Fixing Tailwind content detection (JIT not generating utilities)
 * 2. Migrating custom layout classes to SCSS or Tailwind config
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

			<Box className="card flex-col mb-1 w-full">
				<Text className="card-title">
					CSS Module Component (temporarily using global class)
				</Text>
				<Text className="text-muted">
					CSS Module styles temporarily disabled
				</Text>
			</Box>

			<Box className="flex-row gap-2 mb-1 w-full">
				<Box className="btn primary">
					<Text>Primary</Text>
				</Box>
				<Box className="btn">
					<Text>Standard</Text>
				</Box>
				{/* CSS Module buttons temporarily disabled
				<Box className={buttonStyles.button}>
					<Text className={buttonStyles.text}>Module</Text>
				</Box>
				*/}
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
