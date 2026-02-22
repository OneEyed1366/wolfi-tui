import { createSignal, onCleanup } from 'solid-js'
import spinners, { type SpinnerName } from 'cli-spinners'

//#region Types
export type UseSpinnerProps = { type?: SpinnerName }
export type UseSpinnerResult = { frame: () => string }
//#endregion Types

export const useSpinner = ({ type = 'dots' }: UseSpinnerProps = {}): UseSpinnerResult => {
	const spinner = spinners[type]
	const [frameIndex, setFrameIndex] = createSignal(0)

	// WHY: direct setInterval (not onMount) — onMount doesn't fire in solid-js/universal
	const timer = setInterval(() => {
		setFrameIndex((i) => (i + 1) % spinner.frames.length)
	}, spinner.interval)

	onCleanup(() => clearInterval(timer))

	return { frame: () => spinner.frames[frameIndex()] ?? '' }
}
