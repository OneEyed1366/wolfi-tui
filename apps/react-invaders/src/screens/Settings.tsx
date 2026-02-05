import { useState, useMemo, useCallback } from 'react'
import {
	Box,
	Text,
	Select,
	MultiSelect,
	Newline,
	useInput,
} from '@wolfie/react'
import type {
	Screen,
	Settings as SettingsType,
	Difficulty,
} from '../hooks/useInvaders'
import { BRAND } from '../theme'

//#region Types
type SettingsProps = {
	settings: SettingsType
	onUpdateSettings: (settings: Partial<SettingsType>) => void
	onNavigate: (screen: Screen) => void
}

type Section = 'difficulty' | 'options'
//#endregion Types

//#region Options - MUST be stable references (not recreated on render)
const DIFFICULTY_OPTIONS = [
	{ label: 'Easy - Slower aliens', value: 'easy' },
	{ label: 'Normal - Standard', value: 'normal' },
	{ label: 'Hard - Fast aliens', value: 'hard' },
]

const TOGGLE_OPTIONS = [
	{ label: 'Show FPS Counter', value: 'showFps' },
	{ label: 'Shield Health Bars', value: 'shieldBars' },
	{ label: 'Kill Log', value: 'killLog' },
	{ label: 'Alien Animation', value: 'alienAnim' },
	{ label: 'Debug Mode', value: 'debug' },
]
//#endregion Options

//#region Component
export function Settings({
	settings,
	onUpdateSettings,
	onNavigate,
}: SettingsProps) {
	const [section, setSection] = useState<Section>('difficulty')

	// Current toggles based on settings
	const currentToggles = useMemo(() => {
		const toggles: string[] = []
		if (settings.showFps) toggles.push('showFps')
		if (settings.shieldBars) toggles.push('shieldBars')
		if (settings.killLog) toggles.push('killLog')
		if (settings.alienAnim) toggles.push('alienAnim')
		if (settings.debug) toggles.push('debug')
		return toggles
	}, [
		settings.showFps,
		settings.shieldBars,
		settings.killLog,
		settings.alienAnim,
		settings.debug,
	])

	useInput((input, key) => {
		if (key.escape || input === 'q') {
			onNavigate('menu')
			return
		}
		if (key.tab) {
			setSection((s) => (s === 'difficulty' ? 'options' : 'difficulty'))
		}
	})

	// Only update if value actually changed
	const handleDifficultyChange = useCallback(
		(value: string) => {
			if (value === settings.difficulty) return
			onUpdateSettings({ difficulty: value as Difficulty })
		},
		[onUpdateSettings, settings.difficulty]
	)

	const handleTogglesChange = useCallback(
		(values: string[]) => {
			// Only update if values actually changed
			if (
				values.length === currentToggles.length &&
				values.every((v) => currentToggles.includes(v))
			)
				return
			onUpdateSettings({
				showFps: values.includes('showFps'),
				shieldBars: values.includes('shieldBars'),
				killLog: values.includes('killLog'),
				alienAnim: values.includes('alienAnim'),
				debug: values.includes('debug'),
			})
		},
		[onUpdateSettings, currentToggles]
	)

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
					section === 'difficulty' ? 'text-yellow font-bold' : 'text-gray'
				}
			>
				Difficulty: {section !== 'difficulty' && '(Tab to switch)'}
			</Text>
			<Select
				options={DIFFICULTY_OPTIONS}
				value={settings.difficulty}
				onChange={handleDifficultyChange}
				visibleOptionCount={3}
				isDisabled={section !== 'difficulty'}
			/>

			<Newline />
			<Text
				className={
					section === 'options' ? 'text-yellow font-bold' : 'text-gray'
				}
			>
				Options: {section !== 'options' && '(Tab to switch)'}
			</Text>
			<MultiSelect
				options={TOGGLE_OPTIONS}
				value={currentToggles}
				onChange={handleTogglesChange}
				visibleOptionCount={5}
				isDisabled={section !== 'options'}
			/>

			<Newline />
			<Text className="text-gray">Tab Switch • Esc Menu</Text>
		</Box>
	)
}
//#endregion Component
