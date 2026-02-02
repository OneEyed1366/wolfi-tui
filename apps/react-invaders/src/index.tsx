import { render } from '@wolfie/react'
import { App } from './App'
import './styles/tailwind.css'
import { debugLog } from './debug'

//#region Render Configuration
render(<App />, {
	// Performance options
	maxFps: 30, // 30 FPS - reasonable for games
	incrementalRendering: true, // Partial updates now that heights are stable

	// Input options
	exitOnCtrlC: true,

	// Debug callback
	onRender: (metrics) => {
		debugLog(`Render: ${metrics.renderTime}ms`)
	},
})
//#endregion Render Configuration
