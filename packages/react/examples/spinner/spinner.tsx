import render from '../../src/render'
import { Box, Text, Spinner } from '../../src/index'

function Demo() {
	return (
		<Box style={{ flexDirection: 'column', padding: 1, gap: 1 }}>
			<Text style={{ fontWeight: 'bold' }}>Spinner Component Demo</Text>

			<Box style={{ flexDirection: 'column', gap: 1 }}>
				<Box style={{ gap: 1 }}>
					<Text style={{ color: 'gray' }}>Default (dots):</Text>
					<Spinner label="Loading..." />
				</Box>

				<Box style={{ gap: 1 }}>
					<Text style={{ color: 'gray' }}>Line spinner:</Text>
					<Spinner type="line" label="Processing..." />
				</Box>

				<Box style={{ gap: 1 }}>
					<Text style={{ color: 'gray' }}>Arc spinner:</Text>
					<Spinner type="arc" label="Please wait..." />
				</Box>

				<Box style={{ gap: 1 }}>
					<Text style={{ color: 'gray' }}>Bouncing bar:</Text>
					<Spinner type="bouncingBar" label="Working..." />
				</Box>

				<Box style={{ gap: 1 }}>
					<Text style={{ color: 'gray' }}>No label:</Text>
					<Spinner type="dots2" />
				</Box>
			</Box>
		</Box>
	)
}

render(<Demo />)
