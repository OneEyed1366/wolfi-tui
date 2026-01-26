import { ref, onMounted, onUnmounted } from 'vue'
import spinners, { type SpinnerName } from 'cli-spinners'

//#region Types
export type UseSpinnerProps = {
	/**
	 * Type of a spinner.
	 * See [cli-spinners](https://github.com/sindresorhus/cli-spinners) for available spinners.
	 *
	 * @default dots
	 */
	type?: SpinnerName
}

export type UseSpinnerResult = {
	frame: string
}
//#endregion Types

//#region Composable
export function useSpinner({
	type = 'dots',
}: UseSpinnerProps = {}): UseSpinnerResult {
	const frameIndex = ref(0)
	const spinner = spinners[type]

	let timer: ReturnType<typeof setInterval> | null = null

	onMounted(() => {
		timer = setInterval(() => {
			const isLastFrame = frameIndex.value === spinner.frames.length - 1
			frameIndex.value = isLastFrame ? 0 : frameIndex.value + 1
		}, spinner.interval)
	})

	onUnmounted(() => {
		if (timer) {
			clearInterval(timer)
		}
	})

	return {
		get frame() {
			return spinner.frames[frameIndex.value] ?? ''
		},
	}
}
//#endregion Composable
