import { test, expect } from 'vitest'
import { defineComponent, h } from 'vue'
import { Box, Text } from '../../src/components'
import { renderToString } from '../helpers/render-to-string'

test('padding', () => {
	const App = defineComponent({
		render() {
			return h(Box, { style: { padding: 2 } }, () => h(Text, {}, () => 'X'))
		},
	})

	const output = renderToString(App)
	expect(output).toBe('\n\n  X\n\n')
})

test('padding X', () => {
	const App = defineComponent({
		render() {
			return h(Box, {}, () => [
				h(Box, { style: { paddingX: 2 } }, () => h(Text, {}, () => 'X')),
				h(Text, {}, () => 'Y'),
			])
		},
	})

	const output = renderToString(App)
	expect(output).toBe('  X  Y')
})

test('padding Y', () => {
	const App = defineComponent({
		render() {
			return h(Box, { style: { paddingY: 2 } }, () => h(Text, {}, () => 'X'))
		},
	})

	const output = renderToString(App)
	expect(output).toBe('\n\nX\n\n')
})

test('padding top', () => {
	const App = defineComponent({
		render() {
			return h(Box, { style: { paddingTop: 2 } }, () => h(Text, {}, () => 'X'))
		},
	})

	const output = renderToString(App)
	expect(output).toBe('\n\nX')
})

test('padding bottom', () => {
	const App = defineComponent({
		render() {
			return h(Box, { style: { paddingBottom: 2 } }, () =>
				h(Text, {}, () => 'X')
			)
		},
	})

	const output = renderToString(App)
	expect(output).toBe('X\n\n')
})

test('padding left', () => {
	const App = defineComponent({
		render() {
			return h(Box, { style: { paddingLeft: 2 } }, () => h(Text, {}, () => 'X'))
		},
	})

	const output = renderToString(App)
	expect(output).toBe('  X')
})

test('padding right', () => {
	const App = defineComponent({
		render() {
			return h(Box, {}, () => [
				h(Box, { style: { paddingRight: 2 } }, () => h(Text, {}, () => 'X')),
				h(Text, {}, () => 'Y'),
			])
		},
	})

	const output = renderToString(App)
	expect(output).toBe('X  Y')
})

test('nested padding', () => {
	const App = defineComponent({
		render() {
			return h(Box, { style: { padding: 2 } }, () =>
				h(Box, { style: { padding: 2 } }, () => h(Text, {}, () => 'X'))
			)
		},
	})

	const output = renderToString(App)
	expect(output).toBe('\n\n\n\n    X\n\n\n\n')
})

test('padding with multiline string', () => {
	const App = defineComponent({
		render() {
			return h(Box, { style: { padding: 2 } }, () => h(Text, {}, () => 'A\nB'))
		},
	})

	const output = renderToString(App)
	expect(output).toBe('\n\n  A\n  B\n\n')
})

test('apply padding to text with newlines', () => {
	const App = defineComponent({
		render() {
			return h(Box, { style: { padding: 1 } }, () =>
				h(Text, {}, () => 'Hello\nWorld')
			)
		},
	})

	const output = renderToString(App)
	expect(output).toBe('\n Hello\n World\n')
})

test('apply padding to wrapped text', () => {
	const App = defineComponent({
		render() {
			return h(Box, { style: { padding: 1, width: 5 } }, () =>
				h(Text, {}, () => 'Hello World')
			)
		},
	})

	const output = renderToString(App)
	expect(output).toBe('\n Hel\n lo\n Wor\n ld\n')
})
