import { render } from '@wolfie/react'
import createStdout from './create-stdout'

export const renderToString: (
	node: React.JSX.Element,
	options?: { columns?: number; rows?: number; isScreenReaderEnabled?: boolean }
) => string = (node, options) => {
	const stdout = createStdout({
		columns: options?.columns ?? 100,
		rows: options?.rows ?? 24,
	})

	render(node, {
		stdout,
		debug: true,
		isScreenReaderEnabled: options?.isScreenReaderEnabled,
	})

	const output = stdout.get()
	return output
}
