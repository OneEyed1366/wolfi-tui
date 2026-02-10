import { render } from '@wolfie/vue'
import App from './App.vue'
import './styles/tailwind.css'

export { default as App } from './App.vue'

//#region Render Configuration
if (process.env['WOLFIE_VERIFY'] !== '1') {
	render(App, {
		// Performance options
		maxFps: 30, // 30 FPS - reasonable for games
	})
}
//#endregion Render Configuration
