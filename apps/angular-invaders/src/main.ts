import 'zone.js'
import '@angular/compiler'
import { renderWolfie, type WolfieInstance } from '@wolfie/angular'
import { AppComponent } from './app.component'
import './styles/tailwind.css'

export { AppComponent }

if (process.env['WOLFIE_VERIFY'] !== '1') {
	renderWolfie(AppComponent, {
		exitOnCtrlC: true,
	}).then((instance: WolfieInstance) => {
		instance.waitUntilExit()
	})
}
