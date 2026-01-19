import {useMemo, type ReactNode, useContext} from 'react';
import Box from '../../Box.js';
import {useComponentTheme} from '../../../theme/theme.js';
import {UnorderedListItem} from './UnorderedListItem.js';
import {UnorderedListContext} from './UnorderedListContext.js';
import {UnorderedListItemContext} from './UnorderedListItemContext.js';
import type {UnorderedListTheme} from './theme.js';
import {defaultMarker} from './constants.js';

export type UnorderedListProps = {
	/**
	 * List items.
	 */
	readonly children: ReactNode;
};

function UnorderedListComponent({children}: UnorderedListProps) {
	const {depth} = useContext(UnorderedListContext);
	const {styles, config} = useComponentTheme<UnorderedListTheme>('UnorderedList');

	const listContext = useMemo(
		() => ({
			depth: depth + 1,
		}),
		[depth],
	);

	const listItemContext = useMemo(() => {
		const {marker} = config();

		if (typeof marker === 'string') {
			return {marker};
		}

		if (Array.isArray(marker)) {
			return {
				marker: marker[depth] ?? marker.at(-1) ?? defaultMarker,
			};
		}

		return {
			marker: defaultMarker,
		};
	}, [config, depth]);

	return (
		<UnorderedListContext.Provider value={listContext}>
			<UnorderedListItemContext.Provider value={listItemContext}>
				<Box {...styles.list()}>{children}</Box>
			</UnorderedListItemContext.Provider>
		</UnorderedListContext.Provider>
	);
}

export const UnorderedList = Object.assign(UnorderedListComponent, {
	Item: UnorderedListItem,
});
