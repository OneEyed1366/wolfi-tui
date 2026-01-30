import type {
	Renderer2,
	RendererFactory2,
	RendererType2,
	NgZone,
} from '@angular/core'
import { Injectable } from '@angular/core'
import { WolfieRenderer } from './wolfie-renderer'
import type { WolfieAngular } from '../wolfie-angular'
import type { DOMElement } from '@wolfie/core'

//#region WolfieRendererFactory
/**
 * Custom RendererFactory2 implementation for Wolfie TUI
 * Creates WolfieRenderer instances that use @wolfie/core for rendering
 */
@Injectable()
export class WolfieRendererFactory implements RendererFactory2 {
	private renderer: WolfieRenderer | null = null
	private pendingRender = false

	constructor(
		private wolfie: WolfieAngular,
		private ngZone: NgZone
	) {}

	createRenderer(
		_hostElement: DOMElement | null,
		_type: RendererType2 | null
	): Renderer2 {
		// Reuse the same renderer instance for all components
		if (!this.renderer) {
			this.renderer = new WolfieRenderer(this.wolfie.rootNode)
		}
		return this.renderer
	}

	/**
	 * Called when Angular rendering begins
	 */
	begin(): void {
		// Mark that we're in a render cycle
		this.pendingRender = true
	}

	/**
	 * Called when Angular rendering ends
	 * Trigger a single Wolfie render after all Angular changes are applied
	 */
	end(): void {
		if (this.pendingRender) {
			this.pendingRender = false
			// Run outside Angular zone for performance
			this.ngZone.runOutsideAngular(() => {
				this.wolfie.onRender()
			})
		}
	}

	whenRenderingDone(): Promise<void> {
		return Promise.resolve()
	}
}
//#endregion WolfieRendererFactory

//#region Factory Function
/**
 * Create a WolfieRendererFactory for use with Angular's dependency injection
 */
export function createWolfieRendererFactory(
	wolfie: WolfieAngular,
	ngZone: NgZone
): WolfieRendererFactory {
	return new WolfieRendererFactory(wolfie, ngZone)
}
//#endregion Factory Function
