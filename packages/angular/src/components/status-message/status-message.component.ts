import type { OnInit, OnDestroy } from '@angular/core'
import {
	Component,
	Input,
	ChangeDetectionStrategy,
	signal,
	computed,
} from '@angular/core'
import type { Styles } from '@wolfie/core'
import figures from 'figures'
import { BoxComponent } from '../box/box.component'
import { TextComponent } from '../text/text.component'

//#region Types
export type StatusMessageVariant = 'info' | 'success' | 'error' | 'warning'

export interface StatusMessageProps {
	/**
	 * Variant, which determines the color used in the status message.
	 */
	variant: StatusMessageVariant
}
//#endregion Types

//#region Theme
const colorByVariant: Record<StatusMessageVariant, string> = {
	success: 'green',
	error: 'red',
	warning: 'yellow',
	info: 'blue',
}

const iconByVariant: Record<StatusMessageVariant, string> = {
	success: figures.tick,
	error: figures.cross,
	warning: figures.warning,
	info: figures.info,
}

const statusMessageTheme = {
	styles: {
		container: (): Partial<Styles> => ({
			gap: 1,
		}),
		iconContainer: (): Partial<Styles> => ({
			flexShrink: 0,
		}),
		icon: (variant: StatusMessageVariant): Partial<Styles> => ({
			color: colorByVariant[variant],
		}),
		message: (): Partial<Styles> => ({}),
	},
	config: (variant: StatusMessageVariant) => ({
		icon: iconByVariant[variant],
	}),
}
//#endregion Theme

//#region StatusMessageComponent
/**
 * `<w-status-message>` displays a status message with an icon (success checkmark, error X, etc.).
 */
@Component({
	selector: 'w-status-message',
	standalone: true,
	imports: [BoxComponent, TextComponent],
	template: `
		<w-box [style]="containerStyle()">
			<w-box [style]="iconContainerStyle()">
				<w-text [style]="iconStyle()">{{ icon() }}</w-text>
			</w-box>

			<w-text [style]="messageStyle()"><ng-content /></w-text>
		</w-box>
	`,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StatusMessageComponent implements OnInit, OnDestroy {
	//#region Inputs
	@Input({ required: true }) variant!: StatusMessageVariant
	//#endregion Inputs

	//#region Internal State
	private _variant = signal<StatusMessageVariant>('info')
	//#endregion Internal State

	//#region Computed Properties
	readonly containerStyle = computed(() =>
		statusMessageTheme.styles.container()
	)
	readonly iconContainerStyle = computed(() =>
		statusMessageTheme.styles.iconContainer()
	)
	readonly iconStyle = computed(() =>
		statusMessageTheme.styles.icon(this._variant())
	)
	readonly messageStyle = computed(() => statusMessageTheme.styles.message())
	readonly icon = computed(
		() => statusMessageTheme.config(this._variant()).icon
	)
	//#endregion Computed Properties

	//#region Lifecycle
	ngOnInit(): void {
		this._variant.set(this.variant)
	}

	ngOnDestroy(): void {}

	ngOnChanges(): void {
		this._variant.set(this.variant)
	}
	//#endregion Lifecycle
}
//#endregion StatusMessageComponent
