import { useContext, type ReactNode } from 'react'
import Box from '../../Box'
import Text from '../../Text'
import { useComponentTheme } from '../../../theme/theme'
import { OrderedListItemContext } from './OrderedListItemContext'
import type { OrderedListTheme } from './theme'

export type OrderedListItemProps = {
	/**
	 * List item content.
	 */
	readonly children: ReactNode
}

export function OrderedListItem({ children }: OrderedListItemProps) {
	const { marker } = useContext(OrderedListItemContext)
	const { styles } = useComponentTheme<OrderedListTheme>('OrderedList')

	return (
		<Box {...styles.listItem()}>
			<Text {...styles.marker()}>{marker}</Text>
			<Box {...styles.content()}>{children}</Box>
		</Box>
	)
}
