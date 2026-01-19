import React from 'react'
import { test, expect } from 'vitest'
import { Box, Text } from '@wolfie/react'
import { renderToString } from './helpers/render-to-string'

test('display flex', () => {
	const output = renderToString(
		<Box display="flex">
			<Text>X</Text>
		</Box>
	)
	expect(output).toBe('X')
})

test('display none', () => {
	const output = renderToString(
		<Box flexDirection="column">
			<Box display="none">
				<Text>Kitty!</Text>
			</Box>
			<Text>Doggo</Text>
		</Box>
	)

	expect(output).toBe('Doggo')
})
