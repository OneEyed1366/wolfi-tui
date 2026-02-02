import { useApp } from '@wolfie/vue'

//#region Composable
export function useQuit(): () => void {
	const { exit } = useApp()

	const quit = () => {
		exit()
	}

	return quit
}
//#endregion Composable
