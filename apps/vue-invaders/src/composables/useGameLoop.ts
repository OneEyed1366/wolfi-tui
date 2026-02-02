import { onMounted, onUnmounted, type Ref, watch } from 'vue'
import { TICK_INTERVAL } from '../constants'

//#region Types
type UseGameLoopOptions = {
	onTick: () => void
	isRunning: Ref<boolean>
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

	watch(
		isRunning,
		(running) => {
			if (running) {
				startLoop()
			} else {
				stopLoop()
			}
		},
		{ immediate: true }
	)

	onMounted(() => {
		if (isRunning.value) {
			startLoop()
		}
	})

	onUnmounted(() => {
		stopLoop()
	})
}
//#endregion Composable
