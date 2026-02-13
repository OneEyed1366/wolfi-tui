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
import { TextComponent } from '../text/text.component'
import {
	THEME_CONTEXT,
	useComponentTheme,
	type IComponentTheme,
} from '../../theme'

//#region Types
export interface BadgeProps {
	/**
	 * Color.
	 *
	 * @default "magenta"
	 */
	color?: Styles['color']
}
//#endregion Types

//#region Theme
export const badgeTheme: IComponentTheme = {
	styles: {
		container: (color: Styles['color']): Partial<Styles> => ({
			backgroundColor: color,
		}),
		label: (): Partial<Styles> => ({
			color: 'black',
		}),
	},
}
//#endregion Theme

//#region BadgeComponent
/**
 * `<w-badge>` displays a small label/tag for status indicators.
 */
@Component({
	selector: 'w-badge',
	standalone: true,
	imports: [TextComponent],
	template: `
		<w-text [style]="containerStyle()">
			{{ ' ' }}<w-text [style]="labelStyle()"><ng-content /></w-text>{{ ' ' }}
		</w-text>
	`,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BadgeComponent implements OnInit, OnDestroy {
	//#region Inputs
	@Input() color: Styles['color'] = 'magenta'
	//#endregion Inputs

	//#region Theme
	private readonly theme = inject(THEME_CONTEXT)
	private readonly componentTheme = computed(
		() => useComponentTheme<IComponentTheme>(this.theme, 'Badge') ?? badgeTheme
	)
	//#endregion Theme

	//#region Internal State
	private _color = signal<Styles['color']>('magenta')
	//#endregion Internal State

	//#region Computed Properties
	readonly containerStyle = computed(
		() =>
			this.componentTheme().styles?.container?.(this._color()) ??
			badgeTheme.styles!.container(this._color())
	)
	readonly labelStyle = computed(
		() => this.componentTheme().styles?.label?.() ?? badgeTheme.styles!.label()
	)
	//#endregion Computed Properties

	//#region Lifecycle
	ngOnInit(): void {
		this._color.set(this.color)
	}

	ngOnDestroy(): void {}

	ngOnChanges(): void {
		this._color.set(this.color)
	}
	//#endregion Lifecycle
}
//#endregion BadgeComponent
