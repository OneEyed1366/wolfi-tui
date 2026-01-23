import React from 'react'
import { Box, Text } from '../../src/index'

type Properties = {
	isFinished: boolean
	passed: number
	failed: number
	time: string
}

function Summary({ isFinished, passed, failed, time }: Properties) {
	return (
		<Box style={{ flexDirection: 'column', marginTop: 1 }}>
			<Box>
				<Box style={{ width: 14 }}>
					<Text style={{ fontWeight: 'bold' }}>Test Suites:</Text>
				</Box>
				{failed > 0 && (
					<Text style={{ color: 'red', fontWeight: 'bold' }}>
						{failed} failed,{' '}
					</Text>
				)}
				{passed > 0 && (
					<Text style={{ color: 'green', fontWeight: 'bold' }}>
						{passed} passed,{' '}
					</Text>
				)}
				<Text>{passed + failed} total</Text>
			</Box>

			<Box>
				<Box style={{ width: 14 }}>
					<Text style={{ fontWeight: 'bold' }}>Time:</Text>
				</Box>

				<Text>{time}</Text>
			</Box>

			{isFinished && (
				<Box>
					<Text style={{ color: 'gray' }}>Ran all test suites.</Text>
				</Box>
			)}
		</Box>
	)
}

export default Summary
