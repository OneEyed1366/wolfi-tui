import React from 'react'
import { test, expect } from 'vitest'
import { Box, Text } from '@wolfie/react'
import { renderToString } from './helpers/render-to-string.js'

test('wide characters do not add extra space inside fixed-width Box', () => {
	const output = renderToString(
		<Box flexDirection="column">
			<Box>
				<Box width={2}>
					<Text>🍔</Text>
				</Box>
				<Text>|</Text>
			</Box>
			<Box>
				<Box width={2}>
					<Text>⏳</Text>
				</Box>
				<Text>|</Text>
			</Box>
		</Box>
	)

	const lines = output.split('\n')
	// Both lines should have the pipe directly after the 2-column box
	expect(lines[0]).toBe('🍔|')
	expect(lines[1]).toBe('⏳|')
})
