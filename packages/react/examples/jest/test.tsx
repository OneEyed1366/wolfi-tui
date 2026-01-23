import React from 'react'
import { Box, Text } from '../../src/index'

const getBackgroundForStatus = (status: string): string | undefined => {
	switch (status) {
		case 'runs': {
			return 'yellow'
		}

		case 'pass': {
			return 'green'
		}

		case 'fail': {
			return 'red'
		}

		default: {
			return undefined
		}
	}
}

type Properties = {
	status: string
	path: string
}

function Test({ status, path }: Properties) {
	return (
		<Box>
			<Text style={{ color: 'black', backgroundColor: getBackgroundForStatus(status) }}>
				{` ${status.toUpperCase()} `}
			</Text>

			<Box style={{ marginLeft: 1 }}>
				<Text style={{ color: 'gray' }}>{path.split('/')[0]}/</Text>

				<Text style={{ color: 'white', fontWeight: 'bold' }}>
					{path.split('/')[1]}
				</Text>
			</Box>
		</Box>
	)
}

export default Test
