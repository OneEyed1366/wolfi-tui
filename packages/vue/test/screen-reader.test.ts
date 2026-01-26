import { test, expect } from 'vitest'
import { defineComponent, h } from 'vue'
import { Box, Text } from '../src/components'
import { renderToString } from './helpers/render-to-string'

test('render text for screen readers', () => {
	const App = defineComponent({
		render() {
			return h(Box, { 'aria-label': 'Hello World' }, () =>
				h(Text, {}, () => 'Not visible to screen readers')
			)
		},
	})

	const output = renderToString(App, { isScreenReaderEnabled: true })
	expect(output).toBe('Hello World')
})

test('render text for screen readers with aria-hidden', () => {
	const App = defineComponent({
		render() {
			return h(Box, { 'aria-hidden': true }, () =>
				h(Text, {}, () => 'Not visible to screen readers')
			)
		},
	})

	const output = renderToString(App, { isScreenReaderEnabled: true })
	expect(output).toBe('')
})

test('render text for screen readers with aria-role', () => {
	const App = defineComponent({
		render() {
			return h(Box, { 'aria-role': 'button' }, () =>
				h(Text, {}, () => 'Click me')
			)
		},
	})

	const output = renderToString(App, { isScreenReaderEnabled: true })
	expect(output).toBe('button: Click me')
})

test('render select input for screen readers', () => {
	const items = ['Red', 'Green', 'Blue']

	const App = defineComponent({
		render() {
			return h(
				Box,
				{ 'aria-role': 'list', style: { flexDirection: 'column' } },
				() => [
					h(Text, {}, () => 'Select a color:'),
					...items.map((item, index) => {
						const isSelected = index === 1
						const screenReaderLabel = `${index + 1}. ${item}`

						return h(
							Box,
							{
								key: item,
								'aria-label': screenReaderLabel,
								'aria-role': 'listitem',
								'aria-state': { selected: isSelected },
							},
							() => h(Text, {}, () => item)
						)
					}),
				]
			)
		},
	})

	const output = renderToString(App, { isScreenReaderEnabled: true })
	expect(output).toBe(
		'list: Select a color:\nlistitem: 1. Red\nlistitem: (selected) 2. Green\nlistitem: 3. Blue'
	)
})

test('render aria-label only Text for screen readers', () => {
	const App = defineComponent({
		render() {
			return h(Text, { 'aria-label': 'Screen-reader only' })
		},
	})

	const output = renderToString(App, { isScreenReaderEnabled: true })
	expect(output).toBe('Screen-reader only')
})

test('render aria-label only Box for screen readers', () => {
	const App = defineComponent({
		render() {
			return h(Box, { 'aria-label': 'Screen-reader only' })
		},
	})

	const output = renderToString(App, { isScreenReaderEnabled: true })
	expect(output).toBe('Screen-reader only')
})

test('omit ANSI styling in screen-reader output', () => {
	const App = defineComponent({
		render() {
			return h(Box, {}, () =>
				h(
					Text,
					{
						style: {
							color: 'green',
							fontWeight: 'bold',
							inverse: true,
							textDecoration: 'underline',
						},
					},
					() => 'Styled content'
				)
			)
		},
	})

	const output = renderToString(App, { isScreenReaderEnabled: true })
	expect(output).toBe('Styled content')
})

test('skip nodes with display:none style in screen-reader output', () => {
	const App = defineComponent({
		render() {
			return h(Box, {}, () => [
				h(Box, { style: { display: 'none' } }, () =>
					h(Text, {}, () => 'Hidden')
				),
				h(Text, {}, () => 'Visible'),
			])
		},
	})

	const output = renderToString(App, { isScreenReaderEnabled: true })
	expect(output).toBe('Visible')
})

test('render multiple Text components', () => {
	const App = defineComponent({
		render() {
			return h(Box, { style: { flexDirection: 'column' } }, () => [
				h(Text, {}, () => 'Hello'),
				h(Text, {}, () => 'World'),
			])
		},
	})

	const output = renderToString(App, { isScreenReaderEnabled: true })
	expect(output).toBe('Hello\nWorld')
})

test('render nested Box components with Text', () => {
	const App = defineComponent({
		render() {
			return h(Box, { style: { flexDirection: 'column' } }, () => [
				h(Text, {}, () => 'Hello'),
				h(Box, {}, () => h(Text, {}, () => 'World')),
			])
		},
	})

	const output = renderToString(App, { isScreenReaderEnabled: true })
	expect(output).toBe('Hello\nWorld')
})

const NullComponent = defineComponent({
	render() {
		return null
	},
})

test('render component that returns null', () => {
	const App = defineComponent({
		render() {
			return h(Box, { style: { flexDirection: 'column' } }, () => [
				h(Text, {}, () => 'Hello'),
				h(NullComponent),
				h(Text, {}, () => 'World'),
			])
		},
	})

	const output = renderToString(App, { isScreenReaderEnabled: true })
	expect(output).toBe('Hello\nWorld')
})

test('render with aria-state.busy', () => {
	const App = defineComponent({
		render() {
			return h(Box, { 'aria-state': { busy: true } }, () =>
				h(Text, {}, () => 'Loading')
			)
		},
	})

	const output = renderToString(App, { isScreenReaderEnabled: true })
	expect(output).toBe('(busy) Loading')
})

test('render with aria-state.checked', () => {
	const App = defineComponent({
		render() {
			return h(
				Box,
				{ 'aria-role': 'checkbox', 'aria-state': { checked: true } },
				() => h(Text, {}, () => 'Accept terms')
			)
		},
	})

	const output = renderToString(App, { isScreenReaderEnabled: true })
	expect(output).toBe('checkbox: (checked) Accept terms')
})

test('render with aria-state.disabled', () => {
	const App = defineComponent({
		render() {
			return h(
				Box,
				{ 'aria-role': 'button', 'aria-state': { disabled: true } },
				() => h(Text, {}, () => 'Submit')
			)
		},
	})

	const output = renderToString(App, { isScreenReaderEnabled: true })
	expect(output).toBe('button: (disabled) Submit')
})

test('render with aria-state.expanded', () => {
	const App = defineComponent({
		render() {
			return h(
				Box,
				{ 'aria-role': 'combobox', 'aria-state': { expanded: true } },
				() => h(Text, {}, () => 'Select')
			)
		},
	})

	const output = renderToString(App, { isScreenReaderEnabled: true })
	expect(output).toBe('combobox: (expanded) Select')
})

test('render with aria-state.multiline', () => {
	const App = defineComponent({
		render() {
			return h(
				Box,
				{ 'aria-role': 'textbox', 'aria-state': { multiline: true } },
				() => h(Text, {}, () => 'Hello')
			)
		},
	})

	const output = renderToString(App, { isScreenReaderEnabled: true })
	expect(output).toBe('textbox: (multiline) Hello')
})

test('render with aria-state.multiselectable', () => {
	const App = defineComponent({
		render() {
			return h(
				Box,
				{ 'aria-role': 'listbox', 'aria-state': { multiselectable: true } },
				() => h(Text, {}, () => 'Options')
			)
		},
	})

	const output = renderToString(App, { isScreenReaderEnabled: true })
	expect(output).toBe('listbox: (multiselectable) Options')
})

test('render with aria-state.readonly', () => {
	const App = defineComponent({
		render() {
			return h(
				Box,
				{ 'aria-role': 'textbox', 'aria-state': { readonly: true } },
				() => h(Text, {}, () => 'Hello')
			)
		},
	})

	const output = renderToString(App, { isScreenReaderEnabled: true })
	expect(output).toBe('textbox: (readonly) Hello')
})

test('render with aria-state.required', () => {
	const App = defineComponent({
		render() {
			return h(
				Box,
				{ 'aria-role': 'textbox', 'aria-state': { required: true } },
				() => h(Text, {}, () => 'Name')
			)
		},
	})

	const output = renderToString(App, { isScreenReaderEnabled: true })
	expect(output).toBe('textbox: (required) Name')
})

test('render with aria-state.selected', () => {
	const App = defineComponent({
		render() {
			return h(
				Box,
				{ 'aria-role': 'option', 'aria-state': { selected: true } },
				() => h(Text, {}, () => 'Blue')
			)
		},
	})

	const output = renderToString(App, { isScreenReaderEnabled: true })
	expect(output).toBe('option: (selected) Blue')
})

test('render multi-line text', () => {
	const App = defineComponent({
		render() {
			return h(Box, { style: { flexDirection: 'column' } }, () => [
				h(Text, {}, () => 'Line 1'),
				h(Text, {}, () => 'Line 2'),
			])
		},
	})

	const output = renderToString(App, { isScreenReaderEnabled: true })
	expect(output).toBe('Line 1\nLine 2')
})

test('render nested multi-line text', () => {
	const App = defineComponent({
		render() {
			return h(Box, { style: { flexDirection: 'row' } }, () =>
				h(Box, { style: { flexDirection: 'column' } }, () => [
					h(Text, {}, () => 'Line 1'),
					h(Text, {}, () => 'Line 2'),
				])
			)
		},
	})

	const output = renderToString(App, { isScreenReaderEnabled: true })
	expect(output).toBe('Line 1\nLine 2')
})

test('render nested row', () => {
	const App = defineComponent({
		render() {
			return h(Box, { style: { flexDirection: 'column' } }, () =>
				h(Box, { style: { flexDirection: 'row' } }, () => [
					h(Text, {}, () => 'Line 1'),
					h(Text, {}, () => 'Line 2'),
				])
			)
		},
	})

	const output = renderToString(App, { isScreenReaderEnabled: true })
	expect(output).toBe('Line 1 Line 2')
})

test('render multi-line text with roles', () => {
	const App = defineComponent({
		render() {
			return h(
				Box,
				{ 'aria-role': 'list', style: { flexDirection: 'column' } },
				() => [
					h(Box, { 'aria-role': 'listitem' }, () =>
						h(Text, {}, () => 'Item 1')
					),
					h(Box, { 'aria-role': 'listitem' }, () =>
						h(Text, {}, () => 'Item 2')
					),
				]
			)
		},
	})

	const output = renderToString(App, { isScreenReaderEnabled: true })
	expect(output).toBe('list: listitem: Item 1\nlistitem: Item 2')
})

test('render listbox with multiselectable options', () => {
	const App = defineComponent({
		render() {
			return h(
				Box,
				{
					'aria-role': 'listbox',
					'aria-state': { multiselectable: true },
					style: { flexDirection: 'column' },
				},
				() => [
					h(
						Box,
						{ 'aria-role': 'option', 'aria-state': { selected: true } },
						() => h(Text, {}, () => 'Option 1')
					),
					h(
						Box,
						{ 'aria-role': 'option', 'aria-state': { selected: false } },
						() => h(Text, {}, () => 'Option 2')
					),
					h(
						Box,
						{ 'aria-role': 'option', 'aria-state': { selected: true } },
						() => h(Text, {}, () => 'Option 3')
					),
				]
			)
		},
	})

	const output = renderToString(App, { isScreenReaderEnabled: true })
	expect(output).toBe(
		'listbox: (multiselectable) option: (selected) Option 1\noption: Option 2\noption: (selected) Option 3'
	)
})
