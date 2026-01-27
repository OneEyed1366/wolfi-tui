import { describe, test, expect } from 'vitest'
import { h } from 'vue'
import { renderToString } from './helpers/render-to-string'
import { OrderedList, UnorderedList, Text } from '../src'
import figures from 'figures'

describe('List Component Shorthand', () => {
	test('OrderedList wraps direct Text children', async () => {
		const output = await renderToString(
			h(OrderedList, null, () => [
				h(Text, null, () => 'Item 1'),
				h(Text, null, () => 'Item 2'),
			])
		)

		// Should see "1. Item 1" and "2. Item 2"
		expect(output).toContain('1. Item 1')
		expect(output).toContain('2. Item 2')
	})

	test('UnorderedList wraps direct Text children', async () => {
		const output = await renderToString(
			h(UnorderedList, null, () => [
				h(Text, null, () => 'Item A'),
				h(Text, null, () => 'Item B'),
			])
		)

		// Default marker is a bullet for depth 0
		expect(output).toContain(`${figures.bullet} Item A`)
		expect(output).toContain(`${figures.bullet} Item B`)
	})

	test('Nested lists are not double-wrapped', async () => {
		const output = await renderToString(
			h(OrderedList, null, () => [
				h(Text, null, () => 'Top Level'),
				h(UnorderedList, null, () => [h(Text, null, () => 'Nested Item')]),
			])
		)

		// Top Level should have "1. "
		expect(output).toContain('1. Top Level')

		// Nested Item should have bullet marker (depth 0 for the UnorderedList as it's not inside another UnorderedList)
		expect(output).toContain(`${figures.bullet} Nested Item`)
	})
})
