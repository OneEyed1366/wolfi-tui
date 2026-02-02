import { useState, useRef, useMemo, useCallback } from 'react'
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

	// Track mount state to skip initial onChange calls from components
	const difficultyMounted = useRef(false)
	const togglesMounted = useRef(false)

	// Memoize initial toggles - only compute once
	const initialToggles = useMemo(() => {
		const toggles: string[] = []
		if (settings.showFps) toggles.push('showFps')
		if (settings.shieldBars) toggles.push('shieldBars')
		if (settings.killLog) toggles.push('killLog')
		if (settings.alienAnim) toggles.push('alienAnim')
		if (settings.debug) toggles.push('debug')
		return toggles
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []) // Empty deps - only compute on mount

	useInput((input, key) => {
		if (key.escape || input === 'q') {
			onNavigate('menu')
			return
		}
		if (key.tab) {
			setSection((s) => (s === 'difficulty' ? 'options' : 'difficulty'))
		}
	})

	// Stable callback references to prevent re-renders
	const handleDifficultyChange = useCallback(
		(value: string) => {
			if (!difficultyMounted.current) {
				difficultyMounted.current = true
				return
			}
			onUpdateSettings({ difficulty: value as Difficulty })
		},
		[onUpdateSettings]
	)

	const handleTogglesChange = useCallback(
		(values: string[]) => {
			if (!togglesMounted.current) {
				togglesMounted.current = true
				return
			}
			onUpdateSettings({
				showFps: values.includes('showFps'),
				shieldBars: values.includes('shieldBars'),
				killLog: values.includes('killLog'),
				alienAnim: values.includes('alienAnim'),
				debug: values.includes('debug'),
			})
		},
		[onUpdateSettings]
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
				defaultValue={settings.difficulty}
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
				defaultValue={initialToggles}
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
