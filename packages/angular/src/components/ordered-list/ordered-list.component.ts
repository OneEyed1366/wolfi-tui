import type { OnInit, OnDestroy } from '@angular/core'
import { Component, ChangeDetectionStrategy } from '@angular/core'
import type { Styles } from '@wolfie/core'
import { BoxComponent } from '../box/box.component'

//#region Types
export interface OrderedListProps {
	/**
	 * List items.
	 */
	children?: unknown
}
//#endregion Types

//#region Theme
const orderedListTheme = {
	styles: {
		list: (): Partial<Styles> => ({
			flexDirection: 'column',
		}),
	},
}
//#endregion Theme

//#region OrderedListComponent
/**
 * `<w-ordered-list>` displays a numbered list of items.
 *
 * Usage:
 * ```html
 * <w-ordered-list>
 *   <w-ordered-list-item [index]="1" [maxWidth]="1">First item</w-ordered-list-item>
 *   <w-ordered-list-item [index]="2" [maxWidth]="1">Second item</w-ordered-list-item>
 * </w-ordered-list>
 * ```
 */
@Component({
	selector: 'w-ordered-list',
	standalone: true,
	imports: [BoxComponent],
	template: `
		<w-box [style]="listStyle">
			<ng-content />
		</w-box>
	`,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrderedListComponent implements OnInit, OnDestroy {
	//#region Computed Properties
	readonly listStyle = orderedListTheme.styles.list()
	//#endregion Computed Properties

	//#region Lifecycle
	ngOnInit(): void {
		// Component initialized
	}

	ngOnDestroy(): void {
		// Cleanup handled by Angular
	}
	//#endregion Lifecycle
}
//#endregion OrderedListComponent
