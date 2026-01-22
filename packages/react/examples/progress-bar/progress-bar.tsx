import React from 'react'
import render from '../../src/render'
import { Box, Text, ProgressBar } from '../../src/index'

function Demo() {
	const [progress, setProgress] = React.useState(0)

	React.useEffect(() => {
		const timer = setInterval(() => {
			setProgress((prev) => {
				if (prev >= 100) {
					return 0
				}
				return prev + 2
			})
		}, 100)

		return () => {
			clearInterval(timer)
		}
	}, [])

	return (
		<Box style={{ flexDirection: 'column', padding: 1, gap: 1 }}>
			<Text style={{ fontWeight: 'bold' }}>ProgressBar Component Demo</Text>

			<Box style={{ flexDirection: 'column', gap: 1 }}>
				<Box>
					<Box style={{ width: 20 }}>
						<Text>Animated:</Text>
					</Box>
					<Box style={{ flexGrow: 1 }}>
						<ProgressBar value={progress} />
					</Box>
					<Box style={{ width: 6, justifyContent: 'flex-end' }}>
						<Text>{progress}%</Text>
					</Box>
				</Box>

				<Box>
					<Box style={{ width: 20 }}>
						<Text>0% (empty):</Text>
					</Box>
					<Box style={{ flexGrow: 1 }}>
						<ProgressBar value={0} />
					</Box>
				</Box>

				<Box>
					<Box style={{ width: 20 }}>
						<Text>25%:</Text>
					</Box>
					<Box style={{ flexGrow: 1 }}>
						<ProgressBar value={25} />
					</Box>
				</Box>

				<Box>
					<Box style={{ width: 20 }}>
						<Text>50%:</Text>
					</Box>
					<Box style={{ flexGrow: 1 }}>
						<ProgressBar value={50} />
					</Box>
				</Box>

				<Box>
					<Box style={{ width: 20 }}>
						<Text>75%:</Text>
					</Box>
					<Box style={{ flexGrow: 1 }}>
						<ProgressBar value={75} />
					</Box>
				</Box>

				<Box>
					<Box style={{ width: 20 }}>
						<Text>100% (full):</Text>
					</Box>
					<Box style={{ flexGrow: 1 }}>
						<ProgressBar value={100} />
					</Box>
				</Box>
			</Box>
		</Box>
	)
}

render(<Demo />)
