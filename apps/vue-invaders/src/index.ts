import { render } from '@wolfie/vue'
import App from './App.vue'
import './styles/tailwind.css'

//#region Render Configuration
render(App, {
	// Performance options
	maxFps: 30, // 30 FPS - reasonable for games
})
//#endregion Render Configuration
