import { useContext, type ReactNode } from 'react'
import { Box } from '../Box'
import { Text } from '../Text'
import { useComponentTheme } from '../../theme/theme'
import { UnorderedListItemContext } from './UnorderedListItemContext'
import type { IUnorderedListTheme } from './theme'

export type IUnorderedListItemProps = {
	/**
	 * List item content.
	 */
	children: ReactNode
}

export function UnorderedListItem({ children }: IUnorderedListItemProps) {
	const { marker } = useContext(UnorderedListItemContext)
	const { styles } = useComponentTheme<IUnorderedListTheme>('UnorderedList')

	return (
		<Box {...styles.listItem()}>
			<Text {...styles.marker()}>{marker}</Text>
			<Box {...styles.content()}>{children}</Box>
		</Box>
	)
}
