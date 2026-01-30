import { Component, signal } from '@angular/core'
import {
	BoxComponent,
	TextComponent,
	injectInput,
	type Key,
} from '@wolfie/angular'

@Component({
	selector: 'app-input-demo',
	standalone: true,
	imports: [BoxComponent, TextComponent],
	template: `
		<w-box class="flex-col gap-1 w-full">
			<!-- Title -->
			<w-text class="font-bold text-white">Input Demo</w-text>

			<!-- Instructions -->
			<w-box class="border-single border-gray p-1 flex-col">
				<w-text class="text-gray"
					>Type anything to see input handling in action</w-text
				>
				<w-text class="text-gray">Backspace removes last character</w-text>
				<w-text class="text-gray"
					>Arrow keys and special keys are detected</w-text
				>
			</w-box>

			<!-- Current typed text -->
			<w-box class="mt-1 flex-col gap-1">
				<w-text class="text-cyan">Typed text:</w-text>
				<w-box class="border-single border-gray p-1">
					<w-text class="text-white">{{ typedText() || '(empty)' }}</w-text>
				</w-box>
			</w-box>

			<!-- Last key info -->
			<w-box class="mt-1 flex-col gap-1">
				<w-text class="text-cyan">Last key pressed:</w-text>
				<w-text class="text-gray">{{ lastKeyInfo() }}</w-text>
			</w-box>

			<!-- Special key detection -->
			@if (specialKeyMessage()) {
				<w-box class="mt-1 border-single border-gray p-1">
					<w-text class="text-cyan">{{ specialKeyMessage() }}</w-text>
				</w-box>
			}
		</w-box>
	`,
})
export class InputDemoComponent {
	typedText = signal('')
	lastKeyInfo = signal('(none)')
	specialKeyMessage = signal('')

	constructor() {
		injectInput((input: string, key: Key) => {
			// Handle backspace
			if (key.backspace) {
				this.typedText.update((text) => text.slice(0, -1))
				this.lastKeyInfo.set('Backspace')
				this.specialKeyMessage.set('')
				return
			}

			// Handle arrow keys
			if (key.upArrow) {
				this.lastKeyInfo.set('Up Arrow')
				this.specialKeyMessage.set('Arrow key: UP')
				return
			}
			if (key.downArrow) {
				this.lastKeyInfo.set('Down Arrow')
				this.specialKeyMessage.set('Arrow key: DOWN')
				return
			}
			if (key.leftArrow) {
				this.lastKeyInfo.set('Left Arrow')
				this.specialKeyMessage.set('Arrow key: LEFT')
				return
			}
			if (key.rightArrow) {
				this.lastKeyInfo.set('Right Arrow')
				this.specialKeyMessage.set('Arrow key: RIGHT')
				return
			}

			// Handle Ctrl+C
			if (key.ctrl && input === 'c') {
				this.lastKeyInfo.set('Ctrl+C')
				this.specialKeyMessage.set('Ctrl+C detected (exit handled by app)')
				return
			}

			// Handle other Ctrl combinations
			if (key.ctrl) {
				this.lastKeyInfo.set(`Ctrl+${input.toUpperCase()}`)
				this.specialKeyMessage.set(
					`Ctrl combination: Ctrl+${input.toUpperCase()}`
				)
				return
			}

			// Handle Enter
			if (key.return) {
				this.lastKeyInfo.set('Enter')
				this.specialKeyMessage.set('Enter pressed - text submitted!')
				return
			}

			// Handle Escape
			if (key.escape) {
				this.lastKeyInfo.set('Escape')
				this.specialKeyMessage.set('Escape pressed - clearing text')
				this.typedText.set('')
				return
			}

			// Handle Tab
			if (key.tab) {
				this.lastKeyInfo.set(key.shift ? 'Shift+Tab' : 'Tab')
				this.specialKeyMessage.set('Tab key (navigation)')
				return
			}

			// Regular character input
			if (input) {
				this.typedText.update((text) => text + input)
				this.lastKeyInfo.set(`Character: "${input}"`)
				this.specialKeyMessage.set('')
			}
		})
	}
}
