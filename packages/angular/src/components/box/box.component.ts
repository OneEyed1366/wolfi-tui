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
import {
	computeBoxStyle,
	computeBoxBackground,
	type ClassNameValue,
	type AriaRole,
	type AriaState,
} from '@wolfie/shared'
import { BACKGROUND_CONTEXT } from '../../tokens'

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
	providers: [
		{
			provide: BACKGROUND_CONTEXT,
			useFactory: () => ({ backgroundColor: undefined }),
		},
	],
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
	private parentBackground = inject(BACKGROUND_CONTEXT, {
		optional: true,
		skipSelf: true,
	})
	private ownBackground = inject(BACKGROUND_CONTEXT)
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
		return computeBoxStyle(
			{
				className: nativeClass ?? this._className(),
				style: this._style() ?? {},
			},
			this.parentBackground?.backgroundColor
		) as Partial<Styles>
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
		this.updateBackgroundContext()
	}

	ngOnDestroy(): void {
		// Cleanup handled by Angular
	}

	ngOnChanges(): void {
		this._className.set(this.className)
		this._style.set(this.style)
		this.updateBackgroundContext()
	}
	//#endregion Lifecycle

	//#region Private Methods
	private updateBackgroundContext(): void {
		this.ownBackground.backgroundColor = computeBoxBackground(
			{ className: this._className(), style: this._style() ?? {} },
			this.parentBackground?.backgroundColor
		)
	}
	//#endregion Private Methods
}
//#endregion BoxComponent
