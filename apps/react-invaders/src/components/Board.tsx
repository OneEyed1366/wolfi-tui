import { useState, type ReactNode } from 'react'
import { Box, useStdout, measureElement, type DOMElement } from '@wolfie/react'
import { BOARD_WIDTH, BOARD_HEIGHT } from '../constants'
import styles from '../styles/game.module.css'

//#region Types
type BoardProps = {
	children: ReactNode
}
//#endregion Types

//#region Component
export function Board({ children }: BoardProps) {
	const { stdout } = useStdout()
	const [dimensions, setDimensions] = useState({
		width: BOARD_WIDTH,
		height: BOARD_HEIGHT,
	})
	const [ref, setRef] = useState<DOMElement | null>(null)

	// Use measureElement to get actual dimensions
	if (ref) {
		const measured = measureElement(ref)
		if (
			measured.width !== dimensions.width ||
			measured.height !== dimensions.height
		) {
			setDimensions({ width: measured.width, height: measured.height })
		}
	}

	// Calculate board size based on terminal
	const termWidth = stdout?.columns ?? 80
	const termHeight = stdout?.rows ?? 24
	const boardWidth = Math.min(BOARD_WIDTH, termWidth - 4)
	const boardHeight = Math.min(BOARD_HEIGHT, termHeight - 4)

	return (
		<Box
			ref={setRef}
			className={styles.gameBoard}
			style={{
				width: boardWidth,
				height: boardHeight,
				position: 'relative',
				flexDirection: 'column',
			}}
		>
			{children}
		</Box>
	)
}
//#endregion Component
