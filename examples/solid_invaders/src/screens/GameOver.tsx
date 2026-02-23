import { createMemo } from 'solid-js'
import { Box, Text, useInput, Alert } from '@wolfie/solid'
import type { Screen } from '../composables/useInvaders'
import { BRAND } from '../theme'

//#region Props
type GameOverProps = {
	score: number
	wave: number
	onNavigate: (screen: Screen) => void
	onRestart: () => void
}
//#endregion Props

//#region ASCII Art
const GAME_OVER_ASCII = `
  ____    _    __  __ _____    _____     _______ ____
 / ___|  / \\  |  \\/  | ____|  / _ \\ \\   / / ____|  _ \\
| |  _  / _ \\ | |\\/| |  _|   | | | \\ \\ / /|  _| | |_) |
| |_| |/ ___ \\| |  | | |___  | |_| |\\ V / | |___|  _ <
 \\____/_/   \\_\\_|  |_|_____|  \\___/  \\_/  |_____|_| \\_\\
`
//#endregion ASCII Art

//#region Component
export default function GameOver(props: GameOverProps) {
	const formattedScore = createMemo(() =>
		props.score.toString().padStart(6, '0')
	)

	useInput((input, key) => {
		if (key.return || input === 'r') {
			props.onRestart()
		} else if (input === 'h') {
			props.onNavigate('highscores')
		} else if (key.escape || input === 'q') {
			props.onNavigate('menu')
		}
	})

	return (
		<Box
			style={{
				width: '100vw',
				height: '100vh',
				flexDirection: 'column',
				alignItems: 'center',
				justifyContent: 'center',
				backgroundColor: BRAND.bgDark,
			}}
		>
			<Text style={{ color: BRAND.error }} className="font-bold">
				{GAME_OVER_ASCII}
			</Text>

			<Box style={{ marginTop: 2, width: '60%' }}>
				<Alert variant="success" title="Game Over">
					Final score: {formattedScore()} — Wave {props.wave}
				</Alert>
			</Box>

			<Box
				style={{ marginTop: 3, flexDirection: 'column', alignItems: 'center' }}
			>
				<Text style={{ color: BRAND.primary }} className="font-bold">
					[R] Retry
				</Text>
				<Text style={{ color: BRAND.textMuted }}>
					[H] High Scores • [Q] Menu
				</Text>
			</Box>
		</Box>
	)
}
//#endregion Component
