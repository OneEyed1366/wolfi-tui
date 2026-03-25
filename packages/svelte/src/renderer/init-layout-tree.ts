import { logger, type LayoutTree } from '@wolf-tui/core'
import { WolfieElement } from './wolfie-element.js'

/**
 * Verification pass: walk the wrapper tree and confirm every WolfieElement
 * has a Taffy layout node. With eager Taffy node creation in WolfieElement's
 * constructor and cloneNode, this should always hold — log warnings if not.
 *
 * CRITICAL: early-return when nodeName === 'wolfie-text'.
 * Svelte's {#if} blocks insert anchor comment nodes INSIDE wolfie-text elements.
 * Recursing into their children would corrupt Taffy layout — text nodes are
 * leaves measured by setTextDimensions, not flex containers.
 */
export function initLayoutTreeRecursively(
	element: WolfieElement,
	_layoutTree: LayoutTree
): void {
	// wolfie-text is a leaf: Taffy measures it via setTextDimensions.
	// Recursing into its children would corrupt layout — abort.
	if (element.nodeName === 'wolfie-text') return

	const domEl = element.domElement

	if (logger.enabled && domEl.layoutNodeId === undefined) {
		logger.log({
			ts: performance.now(),
			cat: 'svelte',
			op: 'initLayoutTree:missing',
			name: element.nodeName,
		})
	}

	for (const child of element._wchildren) {
		if (child instanceof WolfieElement) {
			initLayoutTreeRecursively(child, _layoutTree)
		}
	}
}
