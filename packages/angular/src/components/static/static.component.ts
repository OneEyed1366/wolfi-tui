import type { OnInit, OnDestroy, OnChanges } from '@angular/core'
import {
	Component,
	Input,
	inject,
	ChangeDetectionStrategy,
	signal,
	computed,
	ElementRef,
	TemplateRef,
	ContentChild,
} from '@angular/core'
import type { Styles, DOMElement } from '@wolfie/core'
import { NgForOf, NgTemplateOutlet } from '@angular/common'

//#region Default Styles
const staticStyles: Partial<Styles> = {
	position: 'absolute',
	flexDirection: 'column',
}
//#endregion Default Styles

//#region StaticComponent
/**
 * `<w-static>` component permanently renders its output above everything else.
 * It's useful for displaying activity like completed tasks or logs—things that
 * don't change after they're rendered (hence the name "Static").
 *
 * It's preferred to use `<w-static>` for use cases like these when you can't know
 * or control the number of items that need to be rendered.
 *
 * For example, Tap uses `<Static>` to display a list of completed tests.
 * Gatsby uses it to display a list of generated pages while still displaying a live progress bar.
 *
 * @example
 * ```html
 * <w-static [items]="completedTasks">
 *   <ng-template let-item let-index="index">
 *     <w-text>Task {{ index }}: {{ item.name }}</w-text>
 *   </ng-template>
 * </w-static>
 * ```
 */
@Component({
	selector: 'w-static',
	standalone: true,
	imports: [NgForOf, NgTemplateOutlet],
	template: `
		<ng-container *ngFor="let item of itemsToRender(); let i = index">
			<ng-container
				*ngTemplateOutlet="
					itemTemplate;
					context: { $implicit: item, index: startIndex() + i }
				"
			></ng-container>
		</ng-container>
	`,
	changeDetection: ChangeDetectionStrategy.OnPush,
	host: {
		'[style]': 'computedStyle()',
	},
})
export class StaticComponent<T = unknown>
	implements OnInit, OnDestroy, OnChanges
{
	//#region Inputs
	@Input() items: T[] = []
	@Input() style?: Partial<Styles>
	//#endregion Inputs

	//#region Content
	@ContentChild(TemplateRef) itemTemplate!: TemplateRef<{
		$implicit: T
		index: number
	}>
	//#endregion Content

	//#region Injected Dependencies
	private elementRef = inject(ElementRef)
	//#endregion Injected Dependencies

	//#region Internal State
	private _items = signal<T[]>([])
	private _style = signal<Partial<Styles> | undefined>(undefined)
	private _index = signal(0)
	//#endregion Internal State

	//#region Computed Properties
	readonly startIndex = computed(() => this._index())

	readonly itemsToRender = computed((): T[] => {
		const items = this._items()
		const index = this._index()
		return items.slice(index)
	})

	readonly computedStyle = computed((): Partial<Styles> => {
		const style = this._style() ?? {}

		return {
			...staticStyles,
			...style,
		} as Partial<Styles>
	})
	//#endregion Computed Properties

	//#region Lifecycle
	ngOnInit(): void {
		this._items.set(this.items)
		this._style.set(this.style)
		this.setInternalStatic()
	}

	ngOnChanges(): void {
		const prevLength = this._items().length
		const newLength = this.items.length

		this._items.set(this.items)
		this._style.set(this.style)

		// Update index when items length changes (sync flush behavior)
		if (newLength !== prevLength) {
			this._index.set(newLength)
		}

		this.setInternalStatic()
	}

	ngOnDestroy(): void {}

	private setInternalStatic(): void {
		// Set internal_static property on the DOM element
		const el = this.elementRef.nativeElement as DOMElement
		el.internal_static = true
	}
	//#endregion Lifecycle
}
//#endregion StaticComponent
