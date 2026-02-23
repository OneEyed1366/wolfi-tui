import { createSignal, For } from 'solid-js'
import { Box, Text, useInput } from '@wolfie/solid'
import type { Screen } from '../composables/useInvaders'
import { useQuit } from '../composables/useQuit'
import { BRAND } from '../theme'

//#region Props
type MenuProps = {
	onNavigate: (screen: Screen) => void
	onStartGame: () => void
}
//#endregion Props

//#region Menu Options
const MENU_OPTIONS = [
	{ label: 'Start Game', value: 'start' },
	{ label: 'High Scores', value: 'highscores' },
	{ label: 'Settings', value: 'settings' },
	{ label: 'Help', value: 'help' },
	{ label: 'Quit', value: 'quit' },
]
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
export default function Menu(props: MenuProps) {
	const quit = useQuit()
	const [selectedIndex, setSelectedIndex] = createSignal(0)

	function handleSelect(value: string) {
		switch (value) {
			case 'start':
				props.onStartGame()
				break
			case 'highscores':
				props.onNavigate('highscores')
				break
			case 'settings':
				props.onNavigate('settings')
				break
			case 'help':
				props.onNavigate('help')
				break
			case 'quit':
				quit()
				break
		}
	}

	useInput((input, key) => {
		if (key.upArrow) {
			setSelectedIndex((i) => (i > 0 ? i - 1 : MENU_OPTIONS.length - 1))
		} else if (key.downArrow) {
			setSelectedIndex((i) => (i < MENU_OPTIONS.length - 1 ? i + 1 : 0))
		} else if (key.return) {
			const opt = MENU_OPTIONS[selectedIndex()]
			if (opt) handleSelect(opt.value)
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
			<Text style={{ color: BRAND.primary }} className="font-bold">
				{LOGO}
			</Text>

			<Box style={{ marginTop: 2, marginBottom: 1 }}>
				<Text className="text-gray">↑/↓ Navigate • Enter Select</Text>
			</Box>

			<Box style={{ flexDirection: 'column' }}>
				<For each={MENU_OPTIONS}>
					{(option, index) => (
						<Text
							style={{
								color:
									index() === selectedIndex() ? BRAND.primary : BRAND.textMuted,
							}}
							className={index() === selectedIndex() ? 'font-bold' : undefined}
						>
							{index() === selectedIndex() ? '❯ ' : '  '}
							{option.label}
						</Text>
					)}
				</For>
			</Box>

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
