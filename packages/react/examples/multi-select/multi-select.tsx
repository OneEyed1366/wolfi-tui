import { useState } from 'react'
import render from '../../src/render'
import { Box,
	Text,
	MultiSelect,
	useApp,
	type Option, } from '../../src/index'

const featureOptions: Option[] = [
	{ label: 'TypeScript', value: 'typescript' },
	{ label: 'ESLint', value: 'eslint' },
	{ label: 'Prettier', value: 'prettier' },
	{ label: 'Vitest', value: 'vitest' },
	{ label: 'Husky', value: 'husky' },
	{ label: 'Lint-staged', value: 'lint-staged' },
]

function MultiSelectExample() {
	const { exit } = useApp()
	const [selected, setSelected] = useState<string[]>([])
	const [submitted, setSubmitted] = useState(false)

	const handleChange = (values: string[]) => {
		setSelected(values)
	}

	const handleSubmit = (values: string[]) => {
		setSubmitted(true)
		console.log('Selected features:', values)
		setTimeout(() => exit(), 1000)
	}

	if (submitted) {
		return (
			<Box style={{ flexDirection: 'column', gap: 1 }}>
				<Text style={{ color: 'green', fontWeight: 'bold' }}>
					Configuration complete!
				</Text>
				<Text>Selected features: {selected.join(', ')}</Text>
			</Box>
		)
	}

	return (
		<Box style={{ flexDirection: 'column', gap: 1 }}>
			<Text style={{ fontWeight: 'bold' }}>
				Select features to include (Space to toggle, Enter to confirm):
			</Text>

			<MultiSelect
				options={featureOptions}
				defaultValue={['typescript', 'eslint']}
				onChange={handleChange}
				onSubmit={handleSubmit}
			/>

			{selected.length > 0 && (
				<Box style={{ marginTop: 1 }}>
					<Text style={{ color: 'gray' }}>
						Selected ({selected.length}): {selected.join(', ')}
					</Text>
				</Box>
			)}

			<Box style={{ marginTop: 1 }}>
				<Text style={{ color: 'gray' }}>Press Ctrl+C to cancel</Text>
			</Box>
		</Box>
	)
}

render(<MultiSelectExample />)
