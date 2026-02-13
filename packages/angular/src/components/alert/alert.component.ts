import type { OnInit, OnDestroy } from '@angular/core'
import {
	Component,
	Input,
	ChangeDetectionStrategy,
	signal,
	computed,
	inject,
} from '@angular/core'
import type { Styles } from '@wolfie/core'
import figures from 'figures'
import { BoxComponent } from '../box/box.component'
import { TextComponent } from '../text/text.component'
import {
	THEME_CONTEXT,
	useComponentTheme,
	type IComponentTheme,
} from '../../theme'

//#region Types
export type AlertVariant = 'info' | 'success' | 'error' | 'warning'

export interface AlertProps {
	/**
	 * Variant, which determines the color of the alert.
	 */
	variant: AlertVariant

	/**
	 * Title to show above the message.
	 */
	title?: string
}
//#endregion Types

//#region Theme
const colorByVariant: Record<AlertVariant, string> = {
	info: 'blue',
	success: 'green',
	error: 'red',
	warning: 'yellow',
}

const iconByVariant: Record<AlertVariant, string> = {
	info: figures.info,
	success: figures.tick,
	error: figures.cross,
	warning: figures.warning,
}

export const alertTheme: IComponentTheme = {
	styles: {
		container: (variant: AlertVariant): Partial<Styles> => ({
			flexGrow: 1,
			borderStyle: 'round',
			borderColor: colorByVariant[variant],
			gap: 1,
			paddingX: 1,
		}),
		iconContainer: (): Partial<Styles> => ({
			flexShrink: 0,
		}),
		icon: (variant: AlertVariant): Partial<Styles> => ({
			color: colorByVariant[variant],
		}),
		content: (): Partial<Styles> => ({
			flexShrink: 1,
			flexGrow: 1,
			minWidth: 0,
			flexDirection: 'column',
			gap: 1,
		}),
		title: (): Partial<Styles> => ({
			fontWeight: 'bold',
		}),
		message: (): Partial<Styles> => ({}),
	},
	config: (variant: AlertVariant) => ({
		icon: iconByVariant[variant],
	}),
}
//#endregion Theme

//#region AlertComponent
/**
 * `<w-alert>` displays an alert message with different variants (info, success, error, warning).
 */
@Component({
	selector: 'w-alert',
	standalone: true,
	imports: [BoxComponent, TextComponent],
	template: `
		<w-box [style]="containerStyle()">
			<w-box [style]="iconContainerStyle()">
				<w-text [style]="iconStyle()">{{ icon() }}</w-text>
			</w-box>

			<w-box [style]="contentStyle()">
				@if (title) {
					<w-text [style]="titleStyle()">{{ title }}</w-text>
				}
				<w-text [style]="messageStyle()"><ng-content /></w-text>
			</w-box>
		</w-box>
	`,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AlertComponent implements OnInit, OnDestroy {
	//#region Inputs
	@Input({ required: true }) variant!: AlertVariant
	@Input() title?: string
	//#endregion Inputs

	//#region Theme
	private readonly theme = inject(THEME_CONTEXT)
	private readonly componentTheme = computed(
		() => useComponentTheme<IComponentTheme>(this.theme, 'Alert') ?? alertTheme
	)
	//#endregion Theme

	//#region Internal State
	private _variant = signal<AlertVariant>('info')
	//#endregion Internal State

	//#region Computed Properties
	readonly containerStyle = computed(
		() =>
			this.componentTheme().styles?.container?.(this._variant()) ??
			alertTheme.styles!.container(this._variant())
	)
	readonly iconContainerStyle = computed(
		() =>
			this.componentTheme().styles?.iconContainer?.() ??
			alertTheme.styles!.iconContainer()
	)
	readonly iconStyle = computed(
		() =>
			this.componentTheme().styles?.icon?.(this._variant()) ??
			alertTheme.styles!.icon(this._variant())
	)
	readonly contentStyle = computed(
		() =>
			this.componentTheme().styles?.content?.() ?? alertTheme.styles!.content()
	)
	readonly titleStyle = computed(
		() => this.componentTheme().styles?.title?.() ?? alertTheme.styles!.title()
	)
	readonly messageStyle = computed(
		() =>
			this.componentTheme().styles?.message?.() ?? alertTheme.styles!.message()
	)
	readonly icon = computed(
		() =>
			(this.componentTheme().config?.(this._variant()) as { icon: string })
				?.icon ?? alertTheme.config!(this._variant()).icon
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
//#endregion AlertComponent
