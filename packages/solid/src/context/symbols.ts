import { createContext } from 'solid-js'
import type { Accessor } from 'solid-js'
import type { ITheme } from '@wolfie/shared'
import type {
	StdinContextValue,
	StdoutContextValue,
	StderrContextValue,
	AppContextValue,
	FocusContextValue,
	AccessibilityContextValue,
} from './types'

export const StdinCtx = createContext<StdinContextValue>()
export const StdoutCtx = createContext<StdoutContextValue>()
export const StderrCtx = createContext<StderrContextValue>()
export const AppCtx = createContext<AppContextValue>()
export const FocusCtx = createContext<FocusContextValue>()
export const AccessibilityCtx = createContext<AccessibilityContextValue>({
	isScreenReaderEnabled: false,
})
export const BackgroundCtx = createContext<Accessor<string | undefined>>(
	() => undefined
)
export const ThemeCtx = createContext<ITheme>({ components: {} })
