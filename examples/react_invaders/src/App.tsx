import { useState } from 'react'
import {
	Box,
	ThemeProvider,
	ErrorOverview,
	useStderr,
	useIsScreenReaderEnabled,
} from '@wolfie/react'
import { invadersTheme } from './theme'
import { useInvaders } from './hooks/useInvaders'
import { useTerminalSize } from './hooks/useTerminalSize'
import { Menu } from './screens/Menu'
import { Game } from './screens/Game'
import { GameOver } from './screens/GameOver'
import { HighScores } from './screens/HighScores'
import { Settings } from './screens/Settings'
import { Help } from './screens/Help'

//#region Error Boundary
function ErrorBoundary({ children }: { children: React.ReactNode }) {
	const [error] = useState<Error | null>(null)
	const { write: writeStderr } = useStderr()

	if (error) {
		// Log to stderr for debugging
		writeStderr(`Error: ${error.message}\n${error.stack ?? ''}\n`)

		return <ErrorOverview error={error} />
	}

	// In a real app, we'd use React error boundaries
	// For now, just render children
	return <>{children}</>
}
//#endregion Error Boundary

//#region App Component
function AppContent() {
	const { width: termWidth, height: termHeight } = useTerminalSize()
	const {
		state,
		navigate,
		startGame,
		tick,
		movePlayer,
		shoot,
		alienShoot,
		pause,
		nextWave,
		updateSettings,
		restart,
	} = useInvaders(termWidth, termHeight)

	const isScreenReaderEnabled = useIsScreenReaderEnabled()

	// Announce screen changes for accessibility
	if (isScreenReaderEnabled) {
		// Screen reader would announce the current screen
	}

	return (
		<Box style={{ flexDirection: 'column', minHeight: '100%' }}>
			{state.screen === 'menu' && (
				<Menu onNavigate={navigate} onStartGame={startGame} />
			)}

			{state.screen === 'game' && (
				<Game
					state={state}
					onTick={tick}
					onMovePlayer={movePlayer}
					onShoot={shoot}
					onAlienShoot={alienShoot}
					onPause={pause}
					onNextWave={nextWave}
					onNavigate={navigate}
				/>
			)}

			{state.screen === 'gameover' && (
				<GameOver
					score={state.score}
					wave={state.wave}
					onNavigate={navigate}
					onRestart={restart}
				/>
			)}

			{state.screen === 'highscores' && (
				<HighScores score={state.score} onNavigate={navigate} />
			)}

			{state.screen === 'settings' && (
				<Settings
					settings={state.settings}
					onUpdateSettings={updateSettings}
					onNavigate={navigate}
				/>
			)}

			{state.screen === 'help' && <Help onNavigate={navigate} />}
		</Box>
	)
}
//#endregion App Component

//#region Main App
export function App() {
	return (
		<ThemeProvider theme={invadersTheme}>
			<ErrorBoundary>
				<AppContent />
			</ErrorBoundary>
		</ThemeProvider>
	)
}
//#endregion Main App
