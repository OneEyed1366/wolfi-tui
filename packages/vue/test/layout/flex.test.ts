import { test, expect, describe } from 'vitest'
import { defineComponent, h } from 'vue'
import { Box, Text } from '../../src/components'
import { renderToString } from '../helpers/render-to-string'

describe('Flex Layout', () => {
	test('grow equally', () => {
		const App = defineComponent({
			render() {
				return h(Box, { style: { width: 6 } }, () => [
					h(Box, { style: { flexGrow: 1 } }, () => h(Text, {}, () => 'A')),
					h(Box, { style: { flexGrow: 1 } }, () => h(Text, {}, () => 'B')),
				])
			},
		})

		const output = renderToString(App)
		expect(output).toBe('A  B')
	})

	test('grow one element', () => {
		const App = defineComponent({
			render() {
				return h(Box, { style: { width: 6 } }, () => [
					h(Box, { style: { flexGrow: 1 } }, () => h(Text, {}, () => 'A')),
					h(Text, {}, () => 'B'),
				])
			},
		})

		const output = renderToString(App)
		expect(output).toBe('A    B')
	})

	test('dont shrink', () => {
		const App = defineComponent({
			render() {
				return h(Box, { style: { width: 16 } }, () => [
					h(Box, { style: { flexShrink: 0, width: 6 } }, () =>
						h(Text, {}, () => 'A')
					),
					h(Box, { style: { flexShrink: 0, width: 6 } }, () =>
						h(Text, {}, () => 'B')
					),
					h(Box, { style: { width: 6 } }, () => h(Text, {}, () => 'C')),
				])
			},
		})

		const output = renderToString(App)
		expect(output).toBe('A     B     C')
	})

	test('shrink equally', () => {
		const App = defineComponent({
			render() {
				return h(Box, { style: { width: 10 } }, () => [
					h(Box, { style: { flexShrink: 1, width: 6 } }, () =>
						h(Text, {}, () => 'A')
					),
					h(Box, { style: { flexShrink: 1, width: 6 } }, () =>
						h(Text, {}, () => 'B')
					),
					h(Text, {}, () => 'C'),
				])
			},
		})

		const output = renderToString(App)
		expect(output).toBe('A    B   C')
	})

	test('set flex basis with flexDirection="row" container', () => {
		const App = defineComponent({
			render() {
				return h(Box, { style: { width: 6 } }, () => [
					h(Box, { style: { flexBasis: 3 } }, () => h(Text, {}, () => 'A')),
					h(Text, {}, () => 'B'),
				])
			},
		})

		const output = renderToString(App)
		expect(output).toBe('A  B')
	})

	test('set flex basis in percent with flexDirection="row" container', () => {
		const App = defineComponent({
			render() {
				return h(Box, { style: { width: 6 } }, () => [
					h(Box, { style: { flexBasis: '50%' } }, () => h(Text, {}, () => 'A')),
					h(Text, {}, () => 'B'),
				])
			},
		})

		const output = renderToString(App)
		expect(output).toBe('A  B')
	})

	test('set flex basis with flexDirection="column" container', () => {
		const App = defineComponent({
			render() {
				return h(Box, { style: { height: 6, flexDirection: 'column' } }, () => [
					h(Box, { style: { flexBasis: 3 } }, () => h(Text, {}, () => 'A')),
					h(Text, {}, () => 'B'),
				])
			},
		})

		const output = renderToString(App)
		expect(output).toBe('A\n\n\nB\n\n')
	})

	test('set flex basis in percent with flexDirection="column" container', () => {
		const App = defineComponent({
			render() {
				return h(Box, { style: { height: 6, flexDirection: 'column' } }, () => [
					h(Box, { style: { flexBasis: '50%' } }, () => h(Text, {}, () => 'A')),
					h(Text, {}, () => 'B'),
				])
			},
		})

		const output = renderToString(App)
		expect(output).toBe('A\n\n\nB\n\n')
	})
})
