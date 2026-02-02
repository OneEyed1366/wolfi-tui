import type { ReactNode } from 'react'
import { Box, Text, useFocus } from '@wolfie/react'

//#region Types
type FocusableItemProps = {
	id?: string
	children: ReactNode
	onSelect?: () => void
	autoFocus?: boolean
}
//#endregion Types

//#region Component
export function FocusableItem({
	id,
	children,
	onSelect,
	autoFocus = false,
}: FocusableItemProps) {
	const { isFocused } = useFocus({ id, autoFocus })

	return (
		<Box
			className={isFocused ? 'bg-blue p-x-2' : 'p-x-2'}
			style={{ cursor: 'pointer' }}
		>
			<Text className={isFocused ? 'text-white font-bold' : 'text-gray'}>
				{isFocused ? '> ' : '  '}
				{children}
			</Text>
		</Box>
	)
}
//#endregion Component
