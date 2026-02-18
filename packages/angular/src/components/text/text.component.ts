import type { OnInit, OnDestroy, OnChanges, AfterViewInit } from '@angular/core'
import {
	Component,
	Input,
	inject,
	ChangeDetectionStrategy,
	ElementRef,
} from '@angular/core'
import type { Styles, DOMElement } from '@wolfie/core'
import { computeTextTransform, type ClassNameValue } from '@wolfie/shared'
import { BACKGROUND_CONTEXT } from '../../tokens'

//#region TextComponent
/**
 * `<w-text>` component can display text and change its style to make it bold, underlined, italic, or strikethrough.
 */
@Component({
	selector: 'w-text',
	standalone: true,
	template: `<ng-content />`,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TextComponent
	implements OnInit, OnChanges, OnDestroy, AfterViewInit
{
	private elementRef = inject(ElementRef)

	//#region Inputs
	@Input() className?: ClassNameValue
	@Input() style?: Partial<Styles>
	@Input('aria-label') ariaLabel?: string
	@Input('aria-hidden') ariaHidden?: boolean
	//#endregion Inputs

	//#region Injected Dependencies
	private inheritedBackground = inject(BACKGROUND_CONTEXT, { optional: true })
	//#endregion Injected Dependencies

	//#region Internal State
	private capturedClassName?: ClassNameValue
	private capturedStyle?: Partial<Styles>
	//#endregion Internal State

	//#region Private Methods
	private rebuildTransform(): void {
		const transform = computeTextTransform(
			{ className: this.capturedClassName, style: this.capturedStyle },
			this.inheritedBackground?.backgroundColor
		)
		const el = this.elementRef.nativeElement as DOMElement
		el.internal_transform = transform
	}
	//#endregion Private Methods

	//#region Lifecycle
	ngOnInit(): void {
		// Capture inputs early — @Input() style doesn't flow to el.style
		this.capturedClassName = this.className
		this.capturedStyle = this.style
		this.rebuildTransform()
	}

	ngOnChanges(): void {
		this.capturedClassName = this.className
		this.capturedStyle = this.style
		this.rebuildTransform()
	}

	ngAfterViewInit(): void {
		// Rebuild after view is initialized to ensure element is in DOM
		this.rebuildTransform()
	}

	ngOnDestroy(): void {
		// Cleanup handled by Angular
	}
	//#endregion Lifecycle
}
//#endregion TextComponent
