import { useApp } from '@wolfie/solid'

//#region Composable
export function useQuit(): () => void {
	const { exit } = useApp()

	const quit = () => {
		exit()
	}

	return quit
}
//#endregion Composable
