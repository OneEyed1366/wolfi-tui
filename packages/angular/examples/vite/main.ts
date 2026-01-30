import 'zone.js'
import '@angular/compiler' // Required for JIT compilation of services
import { renderWolfie, type WolfieInstance } from '@wolfie/angular'
import { AppComponent } from './app.component'

// Bootstrap the Angular app
renderWolfie(AppComponent, {
	exitOnCtrlC: true,
}).then((instance: WolfieInstance) => {
	instance.waitUntilExit()
})
