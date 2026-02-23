import { useEffect, useRef } from 'react'
import { TICK_INTERVAL } from '../constants'

//#region Types
type UseGameLoopOptions = {
	onTick: () => void
	isRunning: boolean
	interval?: number
}
//#endregion Types

//#region Hook
export function useGameLoop({
	onTick,
	isRunning,
	interval = TICK_INTERVAL,
}: UseGameLoopOptions): void {
	const tickRef = useRef(onTick)
	tickRef.current = onTick

	useEffect(() => {
		if (!isRunning) return

		const timer = setInterval(() => {
			tickRef.current()
		}, interval)

		return () => {
			clearInterval(timer)
		}
	}, [isRunning, interval])
}
//#endregion Hook
