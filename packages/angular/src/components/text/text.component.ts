import type { OnInit, OnDestroy, AfterViewInit } from '@angular/core'
import {
	Component,
	Input,
	inject,
	ChangeDetectionStrategy,
	ElementRef,
} from '@angular/core'
import chalk from 'chalk'
import { colorize, type Styles, type DOMElement } from '@wolfie/core'
import { BACKGROUND_CONTEXT } from '../../tokens'
import { resolveClassName, type ClassNameValue } from '../../styles'

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
export class TextComponent implements OnInit, OnDestroy, AfterViewInit {
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

	//#region Computed Properties
	private getEffectiveStyles(): Partial<Styles> {
		const el = this.elementRef.nativeElement as DOMElement
		const nativeClass = el.attributes?.['class'] as string | undefined
		const className = nativeClass ?? this.className
		const resolvedClassName = resolveClassName(className)
		const style = el.style || {}
		return {
			...resolvedClassName,
			...style,
		}
	}
	//#endregion Computed Properties

	//#region Transform Function
	/**
	 * Transform function applied to text content for chalk styling
	 */
	readonly transform = (text: string): string => {
		const styles = this.getEffectiveStyles()

		const effectiveColor = styles.color
		const effectiveBackgroundColor = styles.backgroundColor
		const effectiveBold = styles.fontWeight === 'bold'
		const effectiveItalic = styles.fontStyle === 'italic'
		const effectiveUnderline = styles.textDecoration === 'underline'
		const effectiveStrikethrough = styles.textDecoration === 'line-through'
		const effectiveInverse = styles.inverse ?? false

		let result = text

		if (effectiveColor) {
			result = colorize(result, effectiveColor, 'foreground')
		}

		const finalBackgroundColor =
			effectiveBackgroundColor ?? this.inheritedBackground?.backgroundColor
		if (finalBackgroundColor) {
			result = colorize(result, finalBackgroundColor, 'background')
		}

		if (effectiveBold) {
			result = chalk.bold(result)
		}

		if (effectiveItalic) {
			result = chalk.italic(result)
		}

		if (effectiveUnderline) {
			result = chalk.underline(result)
		}

		if (effectiveStrikethrough) {
			result = chalk.strikethrough(result)
		}

		if (effectiveInverse) {
			result = chalk.inverse(result)
		}

		return result
	}
	//#endregion Transform Function

	//#region Lifecycle
	ngOnInit(): void {
		// Component initialized
	}

	ngAfterViewInit(): void {
		// Set internal_transform directly on the DOM element
		// This must be a function, not an attribute string
		const el = this.elementRef.nativeElement as DOMElement
		el.internal_transform = this.transform
	}

	ngOnDestroy(): void {
		// Cleanup handled by Angular
	}
	//#endregion Lifecycle
}
//#endregion TextComponent
