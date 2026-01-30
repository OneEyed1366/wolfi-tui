import type { OnInit, OnDestroy, OnChanges } from '@angular/core'
import {
	Component,
	ChangeDetectionStrategy,
	Input,
	signal,
	computed,
} from '@angular/core'
import type { Styles } from '@wolfie/core'
import { BoxComponent } from '../box/box.component'
import { TextComponent } from '../text/text.component'

//#region Types
export interface OrderedListItemProps {
	/**
	 * Item index (1-based).
	 */
	index?: number

	/**
	 * Maximum width for marker padding.
	 */
	maxWidth?: number

	/**
	 * Parent marker prefix for nested lists.
	 */
	parentMarker?: string
}
//#endregion Types

//#region Theme
const orderedListItemTheme = {
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

//#region OrderedListItemComponent
/**
 * `<w-ordered-list-item>` represents an item in an ordered list with a numbered marker.
 */
@Component({
	selector: 'w-ordered-list-item',
	standalone: true,
	imports: [BoxComponent, TextComponent],
	template: `
		<w-box [style]="listItemStyle">
			<w-text [style]="markerStyle">{{ marker() }}</w-text>
			<w-box [style]="contentStyle"><ng-content /></w-box>
		</w-box>
	`,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrderedListItemComponent implements OnInit, OnDestroy, OnChanges {
	//#region Inputs
	@Input() index = 1
	@Input() maxWidth = 1
	@Input() parentMarker = ''
	//#endregion Inputs

	//#region Internal State
	private _index = signal(1)
	private _maxWidth = signal(1)
	private _parentMarker = signal('')
	//#endregion Internal State

	//#region Computed Properties
	readonly listItemStyle = orderedListItemTheme.styles.listItem()
	readonly markerStyle = orderedListItemTheme.styles.marker()
	readonly contentStyle = orderedListItemTheme.styles.content()

	readonly marker = computed(() => {
		const paddedMarker = `${String(this._index()).padStart(this._maxWidth())}.`
		return `${this._parentMarker()}${paddedMarker}`
	})
	//#endregion Computed Properties

	//#region Lifecycle
	ngOnInit(): void {
		this._index.set(this.index)
		this._maxWidth.set(this.maxWidth)
		this._parentMarker.set(this.parentMarker)
	}

	ngOnChanges(): void {
		this._index.set(this.index)
		this._maxWidth.set(this.maxWidth)
		this._parentMarker.set(this.parentMarker)
	}

	ngOnDestroy(): void {
		// Cleanup handled by Angular
	}
	//#endregion Lifecycle
}
//#endregion OrderedListItemComponent
