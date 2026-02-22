import {
	Component,
	signal,
	computed,
	inject,
	ChangeDetectionStrategy,
} from '@angular/core'
import {
	BoxComponent,
	TextComponent,
	TextInputComponent,
	PasswordInputComponent,
	EmailInputComponent,
	ConfirmInputComponent,
	FocusService,
	injectInput,
	type Key,
} from '@wolfie/angular'

//#region InputDemoComponent
@Component({
	selector: 'app-input-demo',
	standalone: true,
	imports: [
		BoxComponent,
		TextComponent,
		TextInputComponent,
		PasswordInputComponent,
		EmailInputComponent,
		ConfirmInputComponent,
	],
	providers: [FocusService],
	changeDetection: ChangeDetectionStrategy.OnPush,
	template: `
		<w-box class="flex-col gap-1 w-full">
			<w-text class="font-bold text-white">Text Inputs</w-text>

			<!-- Text Input -->
			<w-box class="flex-row">
				<w-text class="w-[12]">Name: </w-text>
				<w-text-input
					placeholder="Enter your name..."
					[suggestions]="nameSuggestions"
					id="name-input"
					[autoFocus]="true"
					(valueChange)="onNameChange($event)"
					(submitValue)="onNameSubmit($event)"
				/>
			</w-box>

			<!-- Password Input -->
			<w-box class="flex-row">
				<w-text class="w-[12]">Password: </w-text>
				<w-password-input
					id="password-input"
					(valueChange)="onPasswordChange($event)"
				/>
			</w-box>

			<!-- Email Input -->
			<w-box class="flex-row">
				<w-text class="w-[12]">Email: </w-text>
				<w-email-input id="email-input" (valueChange)="onEmailChange($event)" />
			</w-box>

			<!-- Confirm Input -->
			<w-box class="flex-row">
				<w-text class="w-[12]">Confirm? </w-text>
				<w-confirm-input
					id="confirm-input"
					(confirm)="onConfirm()"
					(cancel)="onCancel()"
				/>
			</w-box>

			<!-- Current Values -->
			<w-box class="border-single border-gray p-1 mt-1 flex-col">
				<w-text class="font-bold text-cyan">Current Values:</w-text>
				<w-text>Name: {{ name() || '(empty)' }}</w-text>
				<w-text>Password: {{ maskedPassword() }}</w-text>
				<w-text>Email: {{ email() || '(empty)' }}</w-text>
				<w-text>Confirmed: {{ confirmStatus() }}</w-text>
			</w-box>

			<w-text class="text-gray">
				Type to enter values. Tab to switch inputs.
			</w-text>
		</w-box>
	`,
})
export class InputDemoComponent {
	//#region Constants
	readonly nameSuggestions = ['Alice', 'Bob', 'Charlie', 'Diana', 'Edward']
	//#endregion Constants

	//#region Injected Dependencies
	private focusService = inject(FocusService)
	//#endregion Injected Dependencies

	//#region State
	name = signal('')
	password = signal('')
	email = signal('')
	confirmStatus = signal('pending')
	//#endregion State

	//#region Constructor
	constructor() {
		// Handle Tab/Shift+Tab for focus navigation between inputs
		injectInput((_input: string, key: Key) => {
			if (key.tab && !key.shift) {
				this.focusService.focusNext()
			}
			if (key.tab && key.shift) {
				this.focusService.focusPrevious()
			}
		})
	}
	//#endregion Constructor

	//#region Computed
	maskedPassword = computed(() => {
		const pwd = this.password()
		return pwd ? '*'.repeat(pwd.length) : '(empty)'
	})
	//#endregion Computed

	//#region Event Handlers
	onNameChange(value: string): void {
		this.name.set(value)
	}

	onNameSubmit(value: string): void {
		this.name.set(value)
	}

	onPasswordChange(value: string): void {
		this.password.set(value)
	}

	onEmailChange(value: string): void {
		this.email.set(value)
	}

	onConfirm(): void {
		this.confirmStatus.set('confirmed')
	}

	onCancel(): void {
		this.confirmStatus.set('cancelled')
	}
	//#endregion Event Handlers
}
//#endregion InputDemoComponent
