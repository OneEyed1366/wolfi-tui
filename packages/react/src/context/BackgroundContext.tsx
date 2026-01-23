import { createContext } from 'react'
import { type LiteralUnion } from 'type-fest'
import { type ForegroundColorName } from 'ansi-styles'

export type IBackgroundColor = LiteralUnion<ForegroundColorName, string>

export const backgroundContext = createContext<IBackgroundColor | undefined>(
	undefined
)
