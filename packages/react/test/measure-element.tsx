import React, { useState, useRef, useEffect } from 'react'
import { test, expect } from 'vitest'
import delay from 'delay'
import stripAnsi from 'strip-ansi'
import {
	Box,
	Text,
	render,
	measureElement,
	type DOMElement,
} from '@wolfie/react'
import createStdout from './helpers/create-stdout.js'

test('measure element', async () => {
	const stdout = createStdout()

	function Test() {
		const [width, setWidth] = useState(0)
		const ref = useRef<DOMElement>(null)

		useEffect(() => {
			if (!ref.current) {
				return
			}

			setWidth(measureElement(ref.current).width)
		}, [])

		return (
			<Box ref={ref}>
				<Text>Width: {width}</Text>
			</Box>
		)
	}

	render(<Test />, { stdout, debug: true })
	expect((stdout.write as any).firstCall.args[0]).toBe('Width: 0')
	await delay(100)
	expect((stdout.write as any).lastCall.args[0]).toBe('Width: 100')
})

test('calculate layout while rendering is throttled', async () => {
	const stdout = createStdout()

	function Test() {
		const [width, setWidth] = useState(0)
		const ref = useRef<DOMElement>(null)

		useEffect(() => {
			if (!ref.current) {
				return
			}

			setWidth(measureElement(ref.current).width)
		}, [])

		return (
			<Box ref={ref}>
				<Text>Width: {width}</Text>
			</Box>
		)
	}

	const { rerender } = render(null, { stdout, patchConsole: false })
	rerender(<Test />)
	await delay(50)

	expect(
		stripAnsi((stdout.write as any).lastCall.firstArg as string).trim()
	).toBe('Width: 100')
})
