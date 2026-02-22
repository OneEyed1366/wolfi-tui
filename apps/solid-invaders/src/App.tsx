import { Switch, Match } from 'solid-js'
import { useInvaders } from './composables/useInvaders'
import { useTerminalSize } from './composables/useTerminalSize'

//#region Screens
import Menu from './screens/Menu'
import Game from './screens/Game'
import GameOver from './screens/GameOver'
import HighScores from './screens/HighScores'
import Settings from './screens/Settings'
import Help from './screens/Help'
//#endregion Screens

//#region Component
export default function App() {
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

	return (
		<Switch>
			<Match when={state().screen === 'menu'}>
				<Menu onNavigate={navigate} onStartGame={startGame} />
			</Match>
			<Match when={state().screen === 'game'}>
				<Game
					state={state()}
					onTick={tick}
					onMovePlayer={movePlayer}
					onShoot={shoot}
					onAlienShoot={alienShoot}
					onPause={pause}
					onNextWave={nextWave}
					onNavigate={navigate}
				/>
			</Match>
			<Match when={state().screen === 'gameover'}>
				<GameOver
					score={state().score}
					wave={state().wave}
					onNavigate={navigate}
					onRestart={restart}
				/>
			</Match>
			<Match when={state().screen === 'highscores'}>
				<HighScores score={state().score} onNavigate={navigate} />
			</Match>
			<Match when={state().screen === 'settings'}>
				<Settings
					settings={state().settings}
					onUpdateSettings={updateSettings}
					onNavigate={navigate}
				/>
			</Match>
			<Match when={state().screen === 'help'}>
				<Help onNavigate={navigate} />
			</Match>
		</Switch>
	)
}
//#endregion Component
