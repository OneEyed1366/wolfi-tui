import { Box, Text, useInput } from '@wolfie/react'
import type { Screen } from '../hooks/useInvaders'
import { BRAND } from '../theme'

//#region Types
type GameOverProps = {
	score: number
	wave: number
	onNavigate: (screen: Screen) => void
	onRestart: () => void
}
//#endregion Types

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
export function GameOver({
	score,
	wave,
	onNavigate,
	onRestart,
}: GameOverProps) {
	useInput((input, key) => {
		if (key.return || input === 'r') {
			onRestart()
		} else if (input === 'h') {
			onNavigate('highscores')
		} else if (key.escape || input === 'q') {
			onNavigate('menu')
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

			<Box
				style={{ marginTop: 2, flexDirection: 'column', alignItems: 'center' }}
			>
				<Text style={{ color: BRAND.primary }} className="font-bold text-lg">
					SCORE: {score.toString().padStart(6, '0')}
				</Text>
				<Text style={{ color: BRAND.primaryDark }}>Wave {wave}</Text>
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
