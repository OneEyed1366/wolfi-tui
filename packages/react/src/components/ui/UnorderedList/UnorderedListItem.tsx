import { useContext, type ReactNode } from 'react'
import Box from '../../Box'
import Text from '../../Text'
import { useComponentTheme } from '../../../theme/theme'
import { UnorderedListItemContext } from './UnorderedListItemContext'
import type { UnorderedListTheme } from './theme'

export type UnorderedListItemProps = {
	/**
	 * List item content.
	 */
	readonly children: ReactNode
}

export function UnorderedListItem({ children }: UnorderedListItemProps) {
	const { marker } = useContext(UnorderedListItemContext)
	const { styles } = useComponentTheme<UnorderedListTheme>('UnorderedList')

	return (
		<Box {...styles.listItem()}>
			<Text {...styles.marker()}>{marker}</Text>
			<Box {...styles.content()}>{children}</Box>
		</Box>
	)
}
