import {
	createEnvironmentInjector,
	runInInjectionContext,
	ElementRef,
	type EnvironmentInjector,
} from '@angular/core'
import type { Styles } from '@wolfie/core'
import { computeBoxStyle, type ClassNameValue } from '@wolfie/shared'
import { describeBoxContract, type BoxRenderResult } from '@wolfie/spec'
import { BoxComponent } from '../../src/components/box/box.component'
import { BACKGROUND_CONTEXT, type BackgroundContext } from '../../src/tokens'

/**
 * Creates a BoxComponent instance in an injection context, calls ngOnInit,
 * and returns what it wrote to its own BACKGROUND_CONTEXT (the mutable object
 * provided to children).
 *
 * The injector hierarchy mirrors what Angular DI does in a real component tree:
 *   parentInjector → provides BACKGROUND_CONTEXT with parentBg value
 *     childInjector → provides BACKGROUND_CONTEXT with mutable ownBg object
 *                   → provides ElementRef (required by BoxComponent)
 *
 * BoxComponent calls:
 *   inject(BACKGROUND_CONTEXT, { skipSelf: true }) → gets parentBg (from parentInjector)
 *   inject(BACKGROUND_CONTEXT)                    → gets ownBg (from childInjector)
 *   ngOnInit() → calls updateBackgroundContext() → mutates ownBg.backgroundColor
 */
function angularBoxRenderer(
	props: {
		className?: ClassNameValue
		style?: Partial<Styles>
		children?: string
	},
	options?: { parentBg?: string }
): BoxRenderResult {
	const parentBg: BackgroundContext = { backgroundColor: options?.parentBg }
	const ownBg: BackgroundContext = { backgroundColor: undefined }
	const mockElementRef = { nativeElement: { attributes: {} } }

	// Two-level injector hierarchy mimics Angular's component DI tree:
	// parent provides the inherited background context
	const parentInjector = createEnvironmentInjector(
		[{ provide: BACKGROUND_CONTEXT, useValue: parentBg }],
		null as unknown as EnvironmentInjector
	)

	// child provides own background context + ElementRef (used by BoxComponent)
	const childInjector = createEnvironmentInjector(
		[
			{ provide: BACKGROUND_CONTEXT, useValue: ownBg },
			{ provide: ElementRef, useValue: mockElementRef },
		],
		parentInjector
	)

	// Instantiate BoxComponent in the child injection context
	// inject() in class field initializers runs as part of the constructor,
	// so runInInjectionContext provides the context they need.
	let box!: BoxComponent
	runInInjectionContext(childInjector, () => {
		box = new BoxComponent()
	})

	// Set @Input() properties as Angular would after construction
	box.className = props.className
	box.style = props.style as Styles

	// Trigger lifecycle: ngOnInit → updateBackgroundContext() mutates ownBg
	box.ngOnInit()

	// appliedStyle derived from computeBoxStyle — BoxComponent delegates to it
	const appliedStyle = computeBoxStyle({
		className: props.className,
		style: props.style,
	})

	return {
		appliedStyle,
		// ownBg.backgroundColor is what BoxComponent provides to its children
		providedBg: ownBg.backgroundColor,
		// Angular Box doesn't produce terminal output in this unit test mode
		output: props.children ?? 'test',
	}
}

describeBoxContract(angularBoxRenderer)
