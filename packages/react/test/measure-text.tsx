import { test, expect } from 'vitest'
import { measureText } from '@wolf-tui/core'

test('measure "constructor"', () => {
	const { width } = measureText('constructor')
	expect(width).toBe(11)
})
