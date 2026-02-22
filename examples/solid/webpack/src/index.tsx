import { createSignal } from 'solid-js'
import { render, Box, Text, Spinner, useApp, useInput } from '@wolfie/solid'
import './styles.css'

function App() {
	const [count, setCount] = createSignal(0)
	const { exit } = useApp()

	useInput((input, key) => {
		if (input === 'q') {
			exit()
		}
		if (key.upArrow) {
			setCount((c) => c + 1)
		}
		if (key.downArrow) {
			setCount((c) => c - 1)
		}
	})

	return (
		<Box
			style={{
				flexDirection: 'column',
				padding: 1,
				borderStyle: 'round',
				borderColor: 'blue',
			}}
		>
			<Box style={{ marginBottom: 1 }}>
				<Text style={{ color: 'blue', fontWeight: 'bold' }}>
					Wolfie Webpack Portable Demo
				</Text>
			</Box>

			<Box style={{ marginBottom: 1 }}>
				<Text>Counter: </Text>
				<Text style={{ color: 'red', fontWeight: 'bold' }}>{count()}</Text>
			</Box>

			<Box>
				<Spinner />
				<Text style={{ fontStyle: 'italic' }}>
					{' '}
					Press 'q' to exit, ↑/↓ to change counter
				</Text>
			</Box>

			<Box className="p-2 bg-blue-500" style={{ marginTop: 1 }}>
				<Text style={{ color: 'white' }}>Styled with Tailwind</Text>
			</Box>
		</Box>
	)
}

render(App)
