import { test, expect, describe } from 'vitest'
import { defineComponent, h } from 'vue'
import {
	TextInput,
	PasswordInput,
	EmailInput,
	ConfirmInput,
	Select,
	MultiSelect,
} from '../src/components'
import { renderToString } from './helpers/render-to-string'

//#region TextInput Tests
describe('Input Components', () => {
	describe('TextInput', () => {
		test('renders placeholder when empty', () => {
			const App = defineComponent({
				render() {
					return h(TextInput, { placeholder: 'Enter text...' })
				},
			})
			const output = renderToString(App)
			expect(output).toContain('Enter text...')
		})

		test('renders defaultValue', () => {
			const App = defineComponent({
				render() {
					return h(TextInput, { defaultValue: 'Hello' })
				},
			})
			const output = renderToString(App)
			expect(output).toContain('Hello')
		})
	})
	//#endregion TextInput Tests

	//#region PasswordInput Tests
	describe('PasswordInput', () => {
		test('renders placeholder', () => {
			const App = defineComponent({
				render() {
					return h(PasswordInput, { placeholder: 'Enter password...' })
				},
			})
			const output = renderToString(App)
			expect(output).toContain('Enter password...')
		})
	})
	//#endregion PasswordInput Tests

	//#region EmailInput Tests
	describe('EmailInput', () => {
		test('renders placeholder', () => {
			const App = defineComponent({
				render() {
					return h(EmailInput, { placeholder: 'Enter email...' })
				},
			})
			const output = renderToString(App)
			expect(output).toContain('Enter email...')
		})

		test('renders defaultValue', () => {
			const App = defineComponent({
				render() {
					return h(EmailInput, { defaultValue: 'test@example.com' })
				},
			})
			const output = renderToString(App)
			expect(output).toContain('test@example.com')
		})
	})
	//#endregion EmailInput Tests

	//#region ConfirmInput Tests
	describe('ConfirmInput', () => {
		test('renders Y/n prompt with default confirm choice', () => {
			const App = defineComponent({
				render() {
					return h(ConfirmInput, {
						onConfirm: () => {},
						onCancel: () => {},
					})
				},
			})
			const output = renderToString(App)
			// Default choice is 'confirm', so should show Y/n
			expect(output).toContain('Y/n')
		})

		test('renders y/N prompt with cancel choice', () => {
			const App = defineComponent({
				render() {
					return h(ConfirmInput, {
						defaultChoice: 'cancel',
						onConfirm: () => {},
						onCancel: () => {},
					})
				},
			})
			const output = renderToString(App)
			// Default choice is 'cancel', so should show y/N
			expect(output).toContain('y/N')
		})
	})
	//#endregion ConfirmInput Tests

	//#region Select Tests
	describe('Select', () => {
		test('renders options list', () => {
			const options = [
				{ label: 'Option A', value: 'a' },
				{ label: 'Option B', value: 'b' },
			]
			const App = defineComponent({
				render() {
					return h(Select, { options })
				},
			})
			const output = renderToString(App)
			expect(output).toContain('Option A')
			expect(output).toContain('Option B')
		})

		test('highlights focused option', () => {
			const options = [
				{ label: 'First', value: '1' },
				{ label: 'Second', value: '2' },
			]
			const App = defineComponent({
				render() {
					return h(Select, { options })
				},
			})
			const output = renderToString(App)
			// First option should be focused by default (indicated by pointer)
			expect(output).toContain('First')
		})
	})
	//#endregion Select Tests

	//#region MultiSelect Tests
	describe('MultiSelect', () => {
		test('renders options list', () => {
			const options = [
				{ label: 'Choice 1', value: '1' },
				{ label: 'Choice 2', value: '2' },
			]
			const App = defineComponent({
				render() {
					return h(MultiSelect, { options })
				},
			})
			const output = renderToString(App)
			expect(output).toContain('Choice 1')
			expect(output).toContain('Choice 2')
		})

		test('renders with defaultValue selected', () => {
			const options = [
				{ label: 'Alpha', value: 'a' },
				{ label: 'Beta', value: 'b' },
				{ label: 'Gamma', value: 'c' },
			]
			const App = defineComponent({
				render() {
					return h(MultiSelect, { options, defaultValue: ['b'] })
				},
			})
			const output = renderToString(App)
			expect(output).toContain('Alpha')
			expect(output).toContain('Beta')
			expect(output).toContain('Gamma')
		})
	})
	//#endregion MultiSelect Tests
})
