import {useContext, type ReactNode} from 'react';
import Box from '../../Box.js';
import Text from '../../Text.js';
import {useComponentTheme} from '../../../theme/theme.js';
import {OrderedListItemContext} from './OrderedListItemContext.js';
import type {OrderedListTheme} from './theme.js';

export type OrderedListItemProps = {
	/**
	 * List item content.
	 */
	readonly children: ReactNode;
};

export function OrderedListItem({children}: OrderedListItemProps) {
	const {marker} = useContext(OrderedListItemContext);
	const {styles} = useComponentTheme<OrderedListTheme>('OrderedList');

	return (
		<Box {...styles.listItem()}>
			<Text {...styles.marker()}>{marker}</Text>
			<Box {...styles.content()}>{children}</Box>
		</Box>
	);
}
