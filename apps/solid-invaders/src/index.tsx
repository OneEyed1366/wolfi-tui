import { render } from '@wolfie/solid'
import App from './App'
import './styles/tailwind.css'

export { default as App } from './App'

//#region Render Configuration
if (process.env['WOLFIE_VERIFY'] !== '1') {
	render(App, {
		maxFps: 30,
	})
}
//#endregion Render Configuration
