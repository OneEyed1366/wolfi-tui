import type { OnInit, OnDestroy, OnChanges } from '@angular/core'
import {
	Component,
	ChangeDetectionStrategy,
	Input,
	signal,
} from '@angular/core'
import figures from 'figures'
import type { Styles } from '@wolfie/core'
import { BoxComponent } from '../box/box.component'
import { TextComponent } from '../text/text.component'

//#region Types
export interface UnorderedListItemProps {
	/**
	 * Marker to display before the item content.
	 * @default figures.bullet
	 */
	marker?: string
}
//#endregion Types

//#region Theme
const unorderedListItemTheme = {
	styles: {
		listItem: (): Partial<Styles> => ({
			flexDirection: 'row',
		}),
		marker: (): Partial<Styles> => ({
			color: 'green',
		}),
		content: (): Partial<Styles> => ({
			flexDirection: 'column',
			marginLeft: 1,
		}),
	},
}
//#endregion Theme

//#region UnorderedListItemComponent
/**
 * `<w-unordered-list-item>` represents an item in an unordered list with a bullet marker.
 */
@Component({
	selector: 'w-unordered-list-item',
	standalone: true,
	imports: [BoxComponent, TextComponent],
	template: `
		<w-box [style]="listItemStyle">
			<w-text [style]="markerStyle">{{ currentMarker() }}</w-text>
			<w-box [style]="contentStyle"><ng-content /></w-box>
		</w-box>
	`,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UnorderedListItemComponent
	implements OnInit, OnDestroy, OnChanges
{
	//#region Inputs
	@Input() marker: string = figures.bullet
	//#endregion Inputs

	//#region Internal State
	private _marker = signal(figures.bullet)
	//#endregion Internal State

	//#region Computed Properties
	readonly listItemStyle = unorderedListItemTheme.styles.listItem()
	readonly markerStyle = unorderedListItemTheme.styles.marker()
	readonly contentStyle = unorderedListItemTheme.styles.content()

	readonly currentMarker = this._marker.asReadonly()
	//#endregion Computed Properties

	//#region Lifecycle
	ngOnInit(): void {
		this._marker.set(this.marker)
	}

	ngOnChanges(): void {
		this._marker.set(this.marker)
	}

	ngOnDestroy(): void {
		// Cleanup handled by Angular
	}
	//#endregion Lifecycle
}
//#endregion UnorderedListItemComponent
