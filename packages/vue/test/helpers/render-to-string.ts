import type { Component } from 'vue'
import { render } from '../../src/index'
import createStdout from './create-stdout'

export const renderToString: (
	component: Component,
	options?: { columns?: number; rows?: number; isScreenReaderEnabled?: boolean }
) => string = (component, options) => {
	const stdout = createStdout({
		columns: options?.columns ?? 100,
		rows: options?.rows ?? 24,
	})

	// Enable debug mode for synchronous rendering
	render(component, {
		stdout,
		debug: true,
		isScreenReaderEnabled: options?.isScreenReaderEnabled,
	})

	const output = stdout.get()
	// Trim trailing newline to match React renderer behavior for test compatibility
	return output.replace(/\n$/, '')
}
