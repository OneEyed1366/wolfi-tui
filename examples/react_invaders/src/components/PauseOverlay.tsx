import { Box, Text, Transform, Spacer, StatusMessage } from '@wolfie/react'
import styles from '../styles/game.module.css'

//#region Types
type PauseOverlayProps = {
	visible: boolean
}
//#endregion Types

//#region ASCII Art
const PAUSE_ASCII = `
  ____   _   _   _ ____  _____ ____
 |  _ \\ / \\ | | | / ___|| ____|  _ \\
 | |_) / _ \\| | | \\___ \\|  _| | | | |
 |  __/ ___ \\ |_| |___) | |___| |_| |
 |_| /_/   \\_\\___/|____/|_____|____/
`
//#endregion ASCII Art

//#region Component
export function PauseOverlay({ visible }: PauseOverlayProps) {
	if (!visible) return null

	return (
		<Box
			className={styles.pauseOverlay}
			style={{
				position: 'absolute',
				top: 0,
				left: 0,
				right: 0,
				bottom: 0,
				justifyContent: 'center',
				alignItems: 'center',
				flexDirection: 'column',
			}}
		>
			<Spacer />

			<Transform transform={(output) => output.toUpperCase()}>
				<Text className="text-yellow font-bold">{PAUSE_ASCII}</Text>
			</Transform>

			<Spacer />

			<StatusMessage variant="warning">
				Game Paused - Press P to Resume
			</StatusMessage>

			<Spacer />
		</Box>
	)
}
//#endregion Component
