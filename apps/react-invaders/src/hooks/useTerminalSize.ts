import { useState, useEffect } from 'react'
import { useStdout } from '@wolfie/react'

export type TerminalSize = {
	width: number
	height: number
}

export function useTerminalSize(): TerminalSize {
	const { stdout } = useStdout()

	const [size, setSize] = useState<TerminalSize>({
		width: stdout.columns ?? 80,
		height: stdout.rows ?? 24,
	})

	useEffect(() => {
		const handleResize = () => {
			setSize({
				width: stdout.columns ?? 80,
				height: stdout.rows ?? 24,
			})
		}

		stdout.on('resize', handleResize)
		return () => {
			stdout.off('resize', handleResize)
		}
	}, [stdout])

	return size
}
