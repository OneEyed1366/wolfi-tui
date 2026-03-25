import { useCallback } from 'react'
import { useApp } from '@wolf-tui/react'

//#region Hook
export function useQuit(): () => void {
	const { exit } = useApp()

	const quit = useCallback(() => {
		exit()
	}, [exit])

	return quit
}
//#endregion Hook
