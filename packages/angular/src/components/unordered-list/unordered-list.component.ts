import type { OnInit, OnDestroy } from '@angular/core'
import { Component, ChangeDetectionStrategy } from '@angular/core'
import type { Styles } from '@wolfie/core'
import { BoxComponent } from '../box/box.component'

//#region Types
export interface UnorderedListProps {
	/**
	 * List items.
	 */
	children?: unknown
}
//#endregion Types

//#region Theme
const unorderedListTheme = {
	styles: {
		list: (): Partial<Styles> => ({
			flexDirection: 'column',
		}),
	},
}
//#endregion Theme

//#region UnorderedListComponent
/**
 * `<w-unordered-list>` displays a bulleted list of items.
 *
 * Usage:
 * ```html
 * <w-unordered-list>
 *   <w-unordered-list-item>First item</w-unordered-list-item>
 *   <w-unordered-list-item>Second item</w-unordered-list-item>
 * </w-unordered-list>
 * ```
 *
 * For nested lists, use different markers:
 * ```html
 * <w-unordered-list>
 *   <w-unordered-list-item>Parent item
 *     <w-unordered-list>
 *       <w-unordered-list-item marker="-">Nested item</w-unordered-list-item>
 *     </w-unordered-list>
 *   </w-unordered-list-item>
 * </w-unordered-list>
 * ```
 */
@Component({
	selector: 'w-unordered-list',
	standalone: true,
	imports: [BoxComponent],
	template: `
		<w-box [style]="listStyle">
			<ng-content />
		</w-box>
	`,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UnorderedListComponent implements OnInit, OnDestroy {
	//#region Computed Properties
	readonly listStyle = unorderedListTheme.styles.list()
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
//#endregion UnorderedListComponent
