import {useContext, type ReactNode} from 'react';
import Box from '../../Box.js';
import Text from '../../Text.js';
import {useComponentTheme} from '../../../theme/theme.js';
import {UnorderedListItemContext} from './UnorderedListItemContext.js';
import type {UnorderedListTheme} from './theme.js';

export type UnorderedListItemProps = {
	/**
	 * List item content.
	 */
	readonly children: ReactNode;
};

export function UnorderedListItem({children}: UnorderedListItemProps) {
	const {marker} = useContext(UnorderedListItemContext);
	const {styles} = useComponentTheme<UnorderedListTheme>('UnorderedList');

	return (
		<Box {...styles.listItem()}>
			<Text {...styles.marker()}>{marker}</Text>
			<Box {...styles.content()}>{children}</Box>
		</Box>
	);
}
