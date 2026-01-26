import { describe, test, expect } from 'vitest'
import { defineComponent, h } from 'vue'
import { Box, Text } from '../../src/components'
import { renderToString } from '../helpers/render-to-string'

describe('width-height', () => {
	test('set width', () => {
		const App = defineComponent({
			render() {
				return h(Box, {}, () => [
					h(Box, { style: { width: 5 } }, () => h(Text, {}, () => 'A')),
					h(Text, {}, () => 'B'),
				])
			},
		})

		const output = renderToString(App)
		expect(output).toBe('A    B')
	})

	test('set width in percent', () => {
		const App = defineComponent({
			render() {
				return h(Box, { style: { width: 10 } }, () => [
					h(Box, { style: { width: '50%' } }, () => h(Text, {}, () => 'A')),
					h(Text, {}, () => 'B'),
				])
			},
		})

		const output = renderToString(App)
		expect(output).toBe('A    B')
	})

	test('set min width', () => {
		const AppSmaller = defineComponent({
			render() {
				return h(Box, {}, () => [
					h(Box, { style: { minWidth: 5 } }, () => h(Text, {}, () => 'A')),
					h(Text, {}, () => 'B'),
				])
			},
		})

		const smallerOutput = renderToString(AppSmaller)
		expect(smallerOutput).toBe('A    B')

		const AppLarger = defineComponent({
			render() {
				return h(Box, {}, () => [
					h(Box, { style: { minWidth: 2 } }, () => h(Text, {}, () => 'AAAAA')),
					h(Text, {}, () => 'B'),
				])
			},
		})

		const largerOutput = renderToString(AppLarger)
		expect(largerOutput).toBe('AAAAAB')
	})

	// Note: Yoga had a bug with percent minWidth but Taffy handles it correctly
	test('set min width in percent', () => {
		const App = defineComponent({
			render() {
				return h(Box, { style: { width: 10 } }, () => [
					h(Box, { style: { minWidth: '50%' } }, () => h(Text, {}, () => 'A')),
					h(Text, {}, () => 'B'),
				])
			},
		})

		const output = renderToString(App)
		expect(output).toBe('A    B')
	})

	test('set height', () => {
		const App = defineComponent({
			render() {
				return h(Box, { style: { height: 4 } }, () => [
					h(Text, {}, () => 'A'),
					h(Text, {}, () => 'B'),
				])
			},
		})

		const output = renderToString(App)
		expect(output).toBe('AB\n\n\n')
	})

	test('set height in percent', () => {
		const App = defineComponent({
			render() {
				return h(Box, { style: { height: 6, flexDirection: 'column' } }, () => [
					h(Box, { style: { height: '50%' } }, () => h(Text, {}, () => 'A')),
					h(Text, {}, () => 'B'),
				])
			},
		})

		const output = renderToString(App)
		expect(output).toBe('A\n\n\nB\n\n')
	})

	test('cut text over the set height', () => {
		const App = defineComponent({
			render() {
				return h(Box, { style: { height: 2 } }, () =>
					h(Text, {}, () => 'AAAABBBBCCCC')
				)
			},
		})

		const output = renderToString(App, { columns: 4 })
		expect(output).toBe('AAAA\nBBBB')
	})

	test('set min height', () => {
		const AppSmaller = defineComponent({
			render() {
				return h(Box, { style: { minHeight: 4 } }, () => h(Text, {}, () => 'A'))
			},
		})

		const smallerOutput = renderToString(AppSmaller)
		expect(smallerOutput).toBe('A\n\n\n')

		const AppLarger = defineComponent({
			render() {
				return h(Box, { style: { minHeight: 2 } }, () =>
					h(Box, { style: { height: 4 } }, () => h(Text, {}, () => 'A'))
				)
			},
		})

		const largerOutput = renderToString(AppLarger)
		expect(largerOutput).toBe('A\n\n\n')
	})
})
