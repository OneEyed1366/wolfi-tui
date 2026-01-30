import { Component, ChangeDetectionStrategy } from '@angular/core'

//#region SpacerComponent
/**
 * `<w-spacer>` fills remaining space in a flex container
 */
@Component({
	selector: 'w-spacer',
	standalone: true,
	template: ``,
	changeDetection: ChangeDetectionStrategy.OnPush,
	host: {
		'[style.flexGrow]': '1',
	},
})
export class SpacerComponent {}
//#endregion SpacerComponent
