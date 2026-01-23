import { createContext } from 'react'
import { defaultMarker } from './constants'

export type IUnorderedListItemContextProps = {
	/**
	 * Marker that's displayed before each list item.
	 */
	marker: string
}

export const UnorderedListItemContext =
	createContext<IUnorderedListItemContextProps>({
		marker: defaultMarker,
	})
