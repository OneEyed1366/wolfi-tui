import { test, expect } from 'vitest'
import { measureText } from '@wolfie/core'

test('measure "constructor"', () => {
	const { width } = measureText('constructor')
	expect(width).toBe(11)
})
