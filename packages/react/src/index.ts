export type { RenderOptions, Instance } from './render'
export { default as render } from './render'
export { default as Ink, type Options, type RenderMetrics } from './ink'
export type { Props as BoxProps } from './components/Box'
export { default as Box } from './components/Box'
export type { Props as TextProps } from './components/Text'
export { default as Text } from './components/Text'
export type { Props as AppProps } from './components/AppContext'
export type { Props as StdinProps } from './components/StdinContext'
export type { Props as StdoutProps } from './components/StdoutContext'
export type { Props as StderrProps } from './components/StderrContext'
export type { Props as StaticProps } from './components/Static'
export { default as Static } from './components/Static'
export type { Props as TransformProps } from './components/Transform'
export { default as Transform } from './components/Transform'
export type { Props as NewlineProps } from './components/Newline'
export { default as Newline } from './components/Newline'
export { default as Spacer } from './components/Spacer'
export type { Key } from './hooks/use-input'
export { default as useInput } from './hooks/use-input'
export { default as useApp } from './hooks/use-app'
export { default as useStdin } from './hooks/use-stdin'
export { default as useStdout } from './hooks/use-stdout'
export { default as useStderr } from './hooks/use-stderr'
export { default as useFocus } from './hooks/use-focus'
export { default as useFocusManager } from './hooks/use-focus-manager'
export { default as useIsScreenReaderEnabled } from './hooks/use-is-screen-reader-enabled'
export { nonAlphanumericKeys } from '@wolfie/core'
export { measureElement } from '@wolfie/core'
export { type DOMElement } from '@wolfie/core'

// Theme system
export * from './theme/theme'

// Style registry for className support
export {
	registerStyles,
	clearGlobalStyles,
	getGlobalStyle,
	resolveClassName,
} from './styles/index'
export type { ClassNameValue } from './styles/index'

// UI Components
export * from './components/ui/index'
