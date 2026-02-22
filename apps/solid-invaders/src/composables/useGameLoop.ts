import { createEffect, onCleanup, type Accessor } from 'solid-js'
import { TICK_INTERVAL } from '../constants'

//#region Types
type UseGameLoopOptions = {
	onTick: () => void
	isRunning: Accessor<boolean>
	interval?: number
}
//#endregion Types

//#region Composable
export function useGameLoop({
	onTick,
	isRunning,
	interval = TICK_INTERVAL,
}: UseGameLoopOptions): void {
	let timer: ReturnType<typeof setInterval> | null = null

	const startLoop = () => {
		if (timer) return
		timer = setInterval(() => {
			onTick()
		}, interval)
	}

	const stopLoop = () => {
		if (timer) {
			clearInterval(timer)
			timer = null
		}
	}

	createEffect(() => {
		if (isRunning()) {
			startLoop()
		} else {
			stopLoop()
		}
	})

	onCleanup(() => {
		stopLoop()
	})
}
//#endregion Composable
