import { createSignal, createMemo, For } from 'solid-js'
import { Box, Text, Newline, useInput } from '@wolfie/solid'
import type {
	Screen,
	Settings as SettingsType,
	Difficulty,
} from '../composables/useInvaders'
import { BRAND } from '../theme'

//#region Props
type SettingsProps = {
	settings: SettingsType
	onUpdateSettings: (settings: Partial<SettingsType>) => void
	onNavigate: (screen: Screen) => void
}
//#endregion Props

//#region Options
const DIFFICULTY_OPTIONS: { label: string; value: Difficulty }[] = [
	{ label: 'Easy - Slower aliens', value: 'easy' },
	{ label: 'Normal - Standard', value: 'normal' },
	{ label: 'Hard - Fast aliens', value: 'hard' },
]

const TOGGLE_OPTIONS = [
	{ label: 'Show FPS Counter', key: 'showFps' as const },
	{ label: 'Shield Health Bars', key: 'shieldBars' as const },
	{ label: 'Kill Log', key: 'killLog' as const },
	{ label: 'Alien Animation', key: 'alienAnim' as const },
	{ label: 'Debug Mode', key: 'debug' as const },
]
//#endregion Options

//#region Component
export default function Settings(props: SettingsProps) {
	const [section, setSection] = createSignal<'difficulty' | 'options'>(
		'difficulty'
	)
	const [diffIndex, setDiffIndex] = createSignal(
		DIFFICULTY_OPTIONS.findIndex((d) => d.value === props.settings.difficulty)
	)
	const [optionIndex, setOptionIndex] = createSignal(0)

	const currentToggles = createMemo(() => {
		const toggles: Record<string, boolean> = {}
		toggles['showFps'] = props.settings.showFps
		toggles['shieldBars'] = props.settings.shieldBars
		toggles['killLog'] = props.settings.killLog
		toggles['alienAnim'] = props.settings.alienAnim
		toggles['debug'] = props.settings.debug
		return toggles
	})

	useInput((input, key) => {
		if (key.escape || input === 'q') {
			props.onNavigate('menu')
			return
		}
		if (key.tab) {
			setSection((s) => (s === 'difficulty' ? 'options' : 'difficulty'))
			return
		}

		if (section() === 'difficulty') {
			if (key.upArrow) {
				setDiffIndex((i) => (i > 0 ? i - 1 : DIFFICULTY_OPTIONS.length - 1))
			} else if (key.downArrow) {
				setDiffIndex((i) => (i < DIFFICULTY_OPTIONS.length - 1 ? i + 1 : 0))
			} else if (key.return) {
				const opt = DIFFICULTY_OPTIONS[diffIndex()]
				if (opt && opt.value !== props.settings.difficulty) {
					props.onUpdateSettings({ difficulty: opt.value })
				}
			}
		} else {
			if (key.upArrow) {
				setOptionIndex((i) => (i > 0 ? i - 1 : TOGGLE_OPTIONS.length - 1))
			} else if (key.downArrow) {
				setOptionIndex((i) => (i < TOGGLE_OPTIONS.length - 1 ? i + 1 : 0))
			} else if (key.return || input === ' ') {
				const opt = TOGGLE_OPTIONS[optionIndex()]
				if (opt) {
					props.onUpdateSettings({
						[opt.key]: !currentToggles()[opt.key],
					})
				}
			}
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
				padding: 2,
			}}
		>
			<Text style={{ color: BRAND.primary }} className="font-bold text-lg">
				⚙ SETTINGS
			</Text>
			<Newline />

			<Text
				className={
					section() === 'difficulty' ? 'text-yellow font-bold' : 'text-gray'
				}
			>
				Difficulty:{section() !== 'difficulty' ? ' (Tab to switch)' : ''}
			</Text>
			<Box style={{ flexDirection: 'column' }}>
				<For each={DIFFICULTY_OPTIONS}>
					{(opt, index) => (
						<Text
							style={{
								color:
									section() === 'difficulty' && index() === diffIndex()
										? BRAND.primary
										: opt.value === props.settings.difficulty
											? BRAND.success
											: BRAND.textMuted,
							}}
						>
							{section() === 'difficulty' && index() === diffIndex()
								? '❯ '
								: '  '}
							{opt.value === props.settings.difficulty ? '● ' : '○ '}
							{opt.label}
						</Text>
					)}
				</For>
			</Box>

			<Newline />
			<Text
				className={
					section() === 'options' ? 'text-yellow font-bold' : 'text-gray'
				}
			>
				Options:{section() !== 'options' ? ' (Tab to switch)' : ''}
			</Text>
			<Box style={{ flexDirection: 'column' }}>
				<For each={TOGGLE_OPTIONS}>
					{(opt, index) => (
						<Text
							style={{
								color:
									section() === 'options' && index() === optionIndex()
										? BRAND.primary
										: BRAND.textMuted,
							}}
						>
							{section() === 'options' && index() === optionIndex()
								? '❯ '
								: '  '}
							{currentToggles()[opt.key] ? '☑ ' : '☐ '}
							{opt.label}
						</Text>
					)}
				</For>
			</Box>

			<Newline />
			<Text className="text-gray">
				Tab Switch • ↑/↓ Navigate • Enter/Space Toggle • Esc Menu
			</Text>
		</Box>
	)
}
//#endregion Component
