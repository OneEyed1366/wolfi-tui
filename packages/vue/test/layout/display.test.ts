import { test, expect, describe } from 'vitest'
import { defineComponent, h } from 'vue'
import { Box, Text } from '../../src/components'
import { renderToString } from '../helpers/render-to-string'

describe('display', () => {
	test('display flex', () => {
		const App = defineComponent({
			render() {
				return h(Box, { style: { display: 'flex' } }, () =>
					h(Text, {}, () => 'X')
				)
			},
		})

		const output = renderToString(App)
		expect(output).toBe('X')
	})

	test('display none', () => {
		const App = defineComponent({
			render() {
				return h(Box, { style: { flexDirection: 'column' } }, () => [
					h(Box, { style: { display: 'none' } }, () =>
						h(Text, {}, () => 'Kitty!')
					),
					h(Text, {}, () => 'Doggo'),
				])
			},
		})

		const output = renderToString(App)
		expect(output).toBe('Doggo')
	})
})
