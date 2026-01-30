import type { OnInit, OnDestroy, AfterViewInit, OnChanges } from '@angular/core'
import {
	Component,
	Input,
	inject,
	ChangeDetectionStrategy,
	ElementRef,
} from '@angular/core'
import type { DOMElement, OutputTransformer } from '@wolfie/core'
// TODO: Use ACCESSIBILITY_CONTEXT for screen reader support
// import { ACCESSIBILITY_CONTEXT } from '../../tokens'

//#region TransformComponent
/**
 * `<w-transform>` transforms a string representation of components before they're written to output.
 * For example, you might want to apply a gradient to text, add a clickable link,
 * or create some text effects. These use cases can't accept nodes as input;
 * they expect a string. That's what the <Transform> component does: it gives you
 * an output string of its child components and lets you transform it in any way.
 *
 * @example
 * ```html
 * <w-transform [transform]="toUpperCase">
 *   <w-text>hello world</w-text>
 * </w-transform>
 * ```
 *
 * ```typescript
 * toUpperCase = (text: string) => text.toUpperCase();
 * ```
 */
@Component({
	selector: 'w-transform',
	standalone: true,
	template: `<ng-content />`,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TransformComponent
	implements OnInit, OnDestroy, AfterViewInit, OnChanges
{
	//#region Inputs
	/**
	 * Function that transforms children output.
	 * It accepts the rendered text and must return transformed text.
	 */
	@Input({ required: true }) transform!: OutputTransformer

	/**
	 * Screen-reader-specific text to output.
	 * If this is set when screen reader is enabled, all children will be ignored.
	 */
	@Input() accessibilityLabel?: string
	//#endregion Inputs

	//#region Injected Dependencies
	private elementRef = inject(ElementRef)
	// TODO: Use accessibility context for screen reader support
	// private accessibility = inject(ACCESSIBILITY_CONTEXT, { optional: true })
	//#endregion Injected Dependencies

	//#region Lifecycle
	ngOnInit(): void {
		// Component initialized
	}

	ngAfterViewInit(): void {
		this.setInternalTransform()
	}

	ngOnChanges(): void {
		this.setInternalTransform()
	}

	ngOnDestroy(): void {
		// Cleanup handled by Angular
	}

	private setInternalTransform(): void {
		// Set internal_transform directly on the DOM element
		const el = this.elementRef.nativeElement as DOMElement
		el.internal_transform = this.transform
	}
	//#endregion Lifecycle
}
//#endregion TransformComponent
