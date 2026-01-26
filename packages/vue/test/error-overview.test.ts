import { test, expect, describe } from 'vitest'
import { defineComponent, h } from 'vue'
import { ErrorOverview } from '../src/components'
import { renderToString } from './helpers/render-to-string'

describe('ErrorOverview', () => {
	test('renders error message', () => {
		const error = new Error('Something went wrong')
		const App = defineComponent({
			render() {
				return h(ErrorOverview, { error })
			},
		})
		const output = renderToString(App)
		expect(output).toContain('Something went wrong')
	})

	test('renders error name', () => {
		const error = new TypeError('Invalid type')
		const App = defineComponent({
			render() {
				return h(ErrorOverview, { error })
			},
		})
		const output = renderToString(App)
		expect(output).toContain('TypeError')
	})

	test('handles error without stack gracefully', () => {
		const error = new Error('No stack')
		error.stack = undefined
		const App = defineComponent({
			render() {
				return h(ErrorOverview, { error })
			},
		})
		// Should not throw
		const output = renderToString(App)
		expect(output).toContain('No stack')
	})
})
