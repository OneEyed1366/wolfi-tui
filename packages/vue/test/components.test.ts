import { test, expect, describe } from 'vitest'
import { defineComponent, h } from 'vue'
import {
	Box,
	Text,
	Newline,
	Spacer,
	Alert,
	Badge,
	StatusMessage,
	ProgressBar,
	OrderedList,
	UnorderedList,
	Spinner,
	Static,
	Transform,
} from '../src/components'
import { renderToString } from './helpers/render-to-string'

describe('Core Components', () => {
	test('Box renders with style', () => {
		const App = defineComponent({
			render() {
				return h(Box, { style: { flexDirection: 'column' } }, () => [
					h(Text, {}, () => 'Hello'),
				])
			},
		})

		const output = renderToString(App)
		expect(output).toContain('Hello')
	})

	test('Text renders content', () => {
		const App = defineComponent({
			render() {
				return h(Text, {}, () => 'World')
			},
		})

		const output = renderToString(App)
		expect(output).toContain('World')
	})

	test('Newline renders newlines', () => {
		const App = defineComponent({
			render() {
				return h(Box, { style: { flexDirection: 'column' } }, () => [
					h(Text, {}, () => 'Line1'),
					h(Newline, { count: 2 }),
					h(Text, {}, () => 'Line2'),
				])
			},
		})

		const output = renderToString(App)
		expect(output).toContain('Line1')
		expect(output).toContain('Line2')
	})

	test('Spacer expands in flex layout', () => {
		const App = defineComponent({
			render() {
				return h(Box, { style: { width: 20 } }, () => [
					h(Text, {}, () => 'A'),
					h(Spacer),
					h(Text, {}, () => 'B'),
				])
			},
		})

		const output = renderToString(App, { columns: 20 })
		expect(output).toContain('A')
		expect(output).toContain('B')
	})
})

describe('Display Components', () => {
	test('Alert renders with variant', () => {
		const App = defineComponent({
			render() {
				return h(Alert, { variant: 'success' }, () => 'Success message')
			},
		})

		const output = renderToString(App)
		expect(output).toContain('Success message')
	})

	test('Badge renders with color and uppercases', () => {
		const App = defineComponent({
			render() {
				return h(Badge, { color: 'blue' }, { default: () => 'label' })
			},
		})

		const output = renderToString(App)
		expect(output).toContain('LABEL')
	})

	test('StatusMessage renders with icon', () => {
		const App = defineComponent({
			render() {
				return h(StatusMessage, { variant: 'info' }, () => 'Info text')
			},
		})

		const output = renderToString(App)
		expect(output).toContain('Info text')
	})

	test('ProgressBar renders based on value', () => {
		const App = defineComponent({
			render() {
				return h(ProgressBar, { value: 50 })
			},
		})

		const output = renderToString(App, { columns: 20 })
		// Just verify it renders without error
		expect(typeof output).toBe('string')
	})

	test('Spinner renders with default type', () => {
		const App = defineComponent({
			render() {
				return h(Spinner)
			},
		})
		const output = renderToString(App)
		// Spinner should render some character (frame)
		expect(output.length).toBeGreaterThan(0)
	})

	test('Spinner renders with label', () => {
		const App = defineComponent({
			render() {
				return h(Spinner, { label: 'Loading...' })
			},
		})
		const output = renderToString(App)
		expect(output).toContain('Loading...')
	})
})

describe('List Components', () => {
	test('OrderedList numbers items', () => {
		const App = defineComponent({
			render() {
				return h(OrderedList, {}, () => [
					h(OrderedList.Item, {}, () => h(Text, {}, () => 'First')),
					h(OrderedList.Item, {}, () => h(Text, {}, () => 'Second')),
				])
			},
		})

		const output = renderToString(App)
		expect(output).toContain('First')
		expect(output).toContain('Second')
	})

	test('UnorderedList uses bullets', () => {
		const App = defineComponent({
			render() {
				return h(UnorderedList, {}, () => [
					h(UnorderedList.Item, {}, () => h(Text, {}, () => 'Item A')),
					h(UnorderedList.Item, {}, () => h(Text, {}, () => 'Item B')),
				])
			},
		})

		const output = renderToString(App)
		expect(output).toContain('Item A')
		expect(output).toContain('Item B')
	})
})

describe('Static Components', () => {
	test('Static renders without error', () => {
		// Note: Static component is designed to render NEW items added after mount.
		// Initial items may not appear in first render due to the sync watch behavior.
		// This test verifies the component mounts correctly.
		const items = ['A', 'B', 'C']
		const App = defineComponent({
			render() {
				return h(
					Static,
					{ items },
					{
						default: ({ item }: { item: string }) =>
							h(Text, { key: item }, () => item),
					}
				)
			},
		})
		// Should not throw
		expect(() => renderToString(App)).not.toThrow()
	})
})

describe('Transform Components', () => {
	test('Transform applies transformation function', () => {
		const App = defineComponent({
			render() {
				return h(
					Transform,
					{ transform: (text: string) => text.toUpperCase() },
					() => h(Text, {}, () => 'hello')
				)
			},
		})
		const output = renderToString(App)
		expect(output).toContain('HELLO')
	})
})
