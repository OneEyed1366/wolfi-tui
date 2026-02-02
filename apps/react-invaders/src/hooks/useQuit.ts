import { useCallback } from 'react'
import { useApp } from '@wolfie/react'

//#region Hook
export function useQuit(): () => void {
	const { exit } = useApp()

	const quit = useCallback(() => {
		exit()
	}, [exit])

	return quit
}
//#endregion Hook
