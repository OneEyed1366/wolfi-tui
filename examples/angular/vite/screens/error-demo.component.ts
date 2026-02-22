import { Component } from '@angular/core'
import { BoxComponent, TextComponent } from '@wolfie/angular'

@Component({
	selector: 'app-error-demo',
	standalone: true,
	imports: [BoxComponent, TextComponent],
	template: `
		<w-box class="flex-col w-full gap-1">
			<!-- Title -->
			<w-text class="font-bold text-white">Error Demo</w-text>
			<w-text class="text-gray mb-1">
				Demonstrates error display formatting with styled components
			</w-text>

			<!-- Error Display Box -->
			<w-box class="flex-col w-full border-single border-red p-1">
				<!-- Error Title -->
				<w-text class="font-bold text-red"
					>{{ error.name }}: {{ error.message }}</w-text
				>

				<!-- Stack Trace -->
				<w-box class="flex-col mt-1">
					@for (line of stackLines; track line) {
						<w-text class="text-gray">{{ line }}</w-text>
					}
				</w-box>
			</w-box>

			<!-- Explanation -->
			<w-box class="flex-col mt-1">
				<w-text class="text-white">Error Handling Tips:</w-text>
				<w-text class="text-gray"
					>• Use try/catch blocks for async operations</w-text
				>
				<w-text class="text-gray">• Display user-friendly messages</w-text>
				<w-text class="text-gray"
					>• Log detailed stack traces for debugging</w-text
				>
			</w-box>
		</w-box>
	`,
})
export class ErrorDemoComponent {
	error = {
		name: 'TypeError',
		message: "Cannot read properties of undefined (reading 'map')",
		stack: `TypeError: Cannot read properties of undefined (reading 'map')
    at UserService.getUsers (/app/services/user.service.ts:42:18)
    at UserController.list (/app/controllers/user.controller.ts:28:32)
    at Layer.handle (/app/node_modules/express/lib/router/layer.js:95:5)
    at next (/app/node_modules/express/lib/router/route.js:144:13)
    at Route.dispatch (/app/node_modules/express/lib/router/route.js:114:3)`,
	}

	stackLines = this.error.stack
		.split('\n')
		.slice(1)
		.map((line) => line.trim())
}
