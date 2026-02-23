import { Box, Text, Select, useFocusManager, useInput } from '@wolfie/react'
import type { Screen } from '../hooks/useInvaders'
import { useQuit } from '../hooks/useQuit'
import { BRAND } from '../theme'

//#region Types
type MenuProps = {
	onNavigate: (screen: Screen) => void
	onStartGame: () => void
}
//#endregion Types

//#region Menu Options
const MENU_OPTIONS = [
	{ label: 'Start Game', value: 'start' },
	{ label: 'High Scores', value: 'highscores' },
	{ label: 'Settings', value: 'settings' },
	{ label: 'Help', value: 'help' },
	{ label: 'Quit', value: 'quit' },
] as const
//#endregion Menu Options

//#region ASCII Logo
const LOGO = `
 ____  ____   _    ____ _____   ___ _   ___     ___    ____  _____ ____  ____
/ ___||  _ \\ / \\  / ___| ____| |_ _| \\ | \\ \\   / / \\  |  _ \\| ____|  _ \\/ ___|
\\___ \\| |_) / _ \\| |   |  _|    | ||  \\| |\\ \\ / / _ \\ | | | |  _| | |_) \\___ \\
 ___) |  __/ ___ \\ |___| |___   | || |\\  | \\ V / ___ \\| |_| | |___|  _ < ___) |
|____/|_| /_/   \\_\\____|_____| |___|_| \\_|  \\_/_/   \\_\\____/|_____|_| \\_\\____/
`
//#endregion ASCII Logo

//#region Component
export function Menu({ onNavigate, onStartGame }: MenuProps) {
	const quit = useQuit()
	const { focusNext, focusPrevious } = useFocusManager()

	useInput((input, key) => {
		if (key.tab) {
			if (key.shift) {
				focusPrevious()
			} else {
				focusNext()
			}
		}
	})

	const handleChange = (value: string) => {
		switch (value) {
			case 'start':
				onStartGame()
				break
			case 'highscores':
				onNavigate('highscores')
				break
			case 'settings':
				onNavigate('settings')
				break
			case 'help':
				onNavigate('help')
				break
			case 'quit':
				quit()
				break
		}
	}

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
			<Text style={{ color: BRAND.primary }} className="font-bold">
				{LOGO}
			</Text>

			<Box style={{ marginTop: 2, marginBottom: 1 }}>
				<Text className="text-gray">↑/↓ Navigate • Enter Select</Text>
			</Box>

			<Select
				options={MENU_OPTIONS.map((opt) => ({
					label: opt.label,
					value: opt.value,
				}))}
				onChange={handleChange}
			/>

			<Box
				style={{
					position: 'absolute',
					bottom: 1,
					width: '100vw',
					justifyContent: 'center',
				}}
			>
				<Text style={{ color: BRAND.textMuted }}>
					v1.0 • {BRAND.name} Space Invaders
				</Text>
			</Box>
		</Box>
	)
}
//#endregion Component
