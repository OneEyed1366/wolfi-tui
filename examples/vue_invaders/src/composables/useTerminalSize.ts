import { ref, onMounted, onUnmounted, type Ref } from 'vue'
import { useStdout } from '@wolfie/vue'

//#region Types
export type TerminalSize = {
	width: Ref<number>
	height: Ref<number>
}
//#endregion Types

//#region Composable
export function useTerminalSize(): TerminalSize {
	const { stdout } = useStdout()

	const width = ref(stdout.columns ?? 80)
	const height = ref(stdout.rows ?? 24)

	const handleResize = () => {
		width.value = stdout.columns ?? 80
		height.value = stdout.rows ?? 24
	}

	onMounted(() => {
		stdout.on('resize', handleResize)
	})

	onUnmounted(() => {
		stdout.off('resize', handleResize)
	})

	return { width, height }
}
//#endregion Composable
