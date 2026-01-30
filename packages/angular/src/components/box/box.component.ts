import type { OnInit, OnDestroy } from '@angular/core'
import {
	Component,
	Input,
	inject,
	ChangeDetectionStrategy,
	signal,
	computed,
	ElementRef,
} from '@angular/core'
import type { Styles, DOMElement } from '@wolfie/core'
import { BACKGROUND_CONTEXT } from '../../tokens'
import { resolveClassName, type ClassNameValue } from '../../styles'

//#region Types
type AriaRole =
	| 'button'
	| 'checkbox'
	| 'combobox'
	| 'list'
	| 'listbox'
	| 'listitem'
	| 'menu'
	| 'menuitem'
	| 'option'
	| 'progressbar'
	| 'radio'
	| 'radiogroup'
	| 'tab'
	| 'tablist'
	| 'table'
	| 'textbox'
	| 'timer'
	| 'toolbar'

type AriaState = {
	busy?: boolean
	checked?: boolean
	disabled?: boolean
	expanded?: boolean
	multiline?: boolean
	multiselectable?: boolean
	readonly?: boolean
	required?: boolean
	selected?: boolean
}
//#endregion Types

//#region Default Styles
const defaultBoxStyles: Partial<Styles> = {
	flexWrap: 'nowrap',
	flexDirection: 'row',
	flexGrow: 0,
	flexShrink: 1,
}
//#endregion Default Styles

//#region BoxComponent
/**
 * `<w-box>` is an essential Wolfie component to build your layout.
 * It's like `<div style="display: flex">` in the browser.
 */
@Component({
	selector: 'w-box',
	standalone: true,
	template: `<ng-content />`,
	changeDetection: ChangeDetectionStrategy.OnPush,
	host: {
		'[style]': 'computedStyle()',
		'[attr.internal_accessibility]': 'accessibilityAttr()',
	},
})
export class BoxComponent implements OnInit, OnDestroy {
	//#region Inputs
	@Input() className?: ClassNameValue
	@Input() style?: Partial<Styles>
	@Input('aria-label') ariaLabel?: string
	@Input('aria-hidden') ariaHidden?: boolean
	@Input('aria-role') ariaRole?: AriaRole
	@Input('aria-state') ariaState?: AriaState
	//#endregion Inputs

	//#region Injected Dependencies
	private elementRef = inject(ElementRef)
	// Note: accessibility context reserved for future screen reader support
	// private accessibility = inject(ACCESSIBILITY_CONTEXT, { optional: true })
	private inheritedBackground = inject(BACKGROUND_CONTEXT, { optional: true })
	//#endregion Injected Dependencies

	//#region Internal State
	private _className = signal<ClassNameValue>(undefined)
	private _style = signal<Partial<Styles> | undefined>(undefined)
	//#endregion Internal State

	//#region Computed Properties
	readonly computedStyle = computed((): Partial<Styles> => {
		// Read class from ElementRef (native attribute) and merge with className prop
		// This mirrors Vue's attrs.class ?? props.className pattern
		const el = this.elementRef.nativeElement as DOMElement
		const nativeClass = el.attributes?.['class'] as string | undefined
		const className = nativeClass ?? this._className()
		const style = this._style() ?? {}
		const resolvedClassName = resolveClassName(className)

		const finalBackgroundColor =
			style.backgroundColor ??
			resolvedClassName.backgroundColor ??
			this.inheritedBackground?.backgroundColor

		return {
			backgroundColor: finalBackgroundColor,
			overflowX:
				style.overflowX ??
				resolvedClassName.overflowX ??
				style.overflow ??
				resolvedClassName.overflow ??
				'visible',
			overflowY:
				style.overflowY ??
				resolvedClassName.overflowY ??
				style.overflow ??
				resolvedClassName.overflow ??
				'visible',
			...defaultBoxStyles,
			...resolvedClassName,
			...style,
		} as Partial<Styles>
	})

	readonly accessibilityAttr = computed(() => {
		return {
			role: this.ariaRole,
			state: this.ariaState,
		}
	})
	//#endregion Computed Properties

	//#region Lifecycle
	ngOnInit(): void {
		this._className.set(this.className)
		this._style.set(this.style)
	}

	ngOnDestroy(): void {
		// Cleanup handled by Angular
	}

	ngOnChanges(): void {
		this._className.set(this.className)
		this._style.set(this.style)
	}
	//#endregion Lifecycle
}
//#endregion BoxComponent
