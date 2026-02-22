import { createSignal, onCleanup, type Accessor } from 'solid-js'
import { useStdout } from '@wolfie/solid'

//#region Types
export type TerminalSize = {
	width: Accessor<number>
	height: Accessor<number>
}
//#endregion Types

//#region Composable
export function useTerminalSize(): TerminalSize {
	const { stdout } = useStdout()

	const [width, setWidth] = createSignal(stdout.columns ?? 80)
	const [height, setHeight] = createSignal(stdout.rows ?? 24)

	const handleResize = () => {
		setWidth(stdout.columns ?? 80)
		setHeight(stdout.rows ?? 24)
	}

	// Register immediately — onMount doesn't fire in universal renderer
	stdout.on('resize', handleResize)

	onCleanup(() => {
		stdout.off('resize', handleResize)
	})

	return { width, height }
}
//#endregion Composable
