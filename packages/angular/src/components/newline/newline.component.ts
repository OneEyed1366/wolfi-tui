import { Component, ChangeDetectionStrategy } from '@angular/core'

//#region NewlineComponent
/**
 * `<w-newline>` adds one or more empty lines between components
 */
@Component({
	selector: 'w-newline',
	standalone: true,
	template: ``,
	changeDetection: ChangeDetectionStrategy.OnPush,
	host: {
		'[style.height]': '1',
	},
})
export class NewlineComponent {}
//#endregion NewlineComponent
