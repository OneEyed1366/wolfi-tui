// Main orchestrator
export {
	WolfieAngular,
	layoutTreeRegistry,
	type WolfieOptions,
	type WolfieAngularInstance,
} from './wolfie-angular'

// Bootstrap
export {
	renderWolfie,
	render,
	type RenderOptions,
	type WolfieInstance,
} from './bootstrap'

// Renderer
export { WolfieRenderer } from './renderer/wolfie-renderer'
export {
	WolfieRendererFactory,
	createWolfieRendererFactory,
} from './renderer/wolfie-renderer-factory'

// Tokens
export {
	STDIN_CONTEXT,
	STDOUT_CONTEXT,
	STDERR_CONTEXT,
	APP_CONTEXT,
	ACCESSIBILITY_CONTEXT,
	BACKGROUND_CONTEXT,
	FOCUS_CONTEXT,
	WOLFIE_INSTANCE,
	type StdinContext,
	type StdoutContext,
	type StderrContext,
	type AppContext,
	type AccessibilityContext,
	type BackgroundContext,
	type FocusContext,
	type Focusable,
} from './tokens'

// Services
export {
	StdinService,
	StdoutService,
	StderrService,
	AppService,
	FocusService,
	injectInput,
	type Key,
	type InputHandler,
	type InputOptions,
	type FocusOptions,
} from './services'

// Components
export {
	BoxComponent,
	TextComponent,
	NewlineComponent,
	SpacerComponent,
} from './components'

// Styles
export {
	registerStyles,
	registerTailwindMetadata,
	clearGlobalStyles,
	getGlobalStyle,
	resolveClassName,
	type ClassNameValue,
} from './styles'
