import { render } from '../../src/index'
import { createStdout } from './create-stdout'

export const renderToString = (
	component: (props?: any) => any,
	options?: { columns?: number; rows?: number; isScreenReaderEnabled?: boolean }
): string => {
	const stdout = createStdout({
		columns: options?.columns ?? 100,
		rows: options?.rows ?? 24,
	})

	render(component, {
		stdout,
		debug: true,
		isScreenReaderEnabled: options?.isScreenReaderEnabled,
	})

	// Trim trailing newline to match React renderer behavior for test compatibility
	return stdout.get().replace(/\n$/, '')
}
