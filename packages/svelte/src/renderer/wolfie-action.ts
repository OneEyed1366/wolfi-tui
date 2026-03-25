import { setStyle, applyLayoutStyle, logger, type Styles } from '@wolf-tui/core'
import type { WolfieElement } from './wolfie-element.js'

//#region Types
interface WolfiePropsPayload {
	style?: Styles
	internal_transform?: (text: string, index: number) => string
	internal_static?: boolean
}
//#endregion Types

//#region wolfieProps action
/**
 * Svelte action that applies style objects, internal_transform functions, and
 * internal_static flags directly to a WolfieElement's core DOMElement.
 *
 * Svelte's set_custom_element_data() explicitly blocks style from the setter
 * path (prop !== 'style'). Functions get typeof === 'function', not 'object',
 * so Svelte would stringify them via setAttribute. This action bypasses both.
 */
export function wolfieProps(node: WolfieElement, props: WolfiePropsPayload) {
	function apply(p: WolfiePropsPayload, phase: string) {
		if (logger.enabled) {
			logger.log({
				ts: performance.now(),
				cat: 'svelte',
				op: 'wolfieProps:' + phase,
				name: node.nodeName,
				nodeId: node.domElement.layoutNodeId,
				hasStyle: !!p.style,
				hasTransform: p.internal_transform !== undefined,
				flexDir: p.style?.flexDirection,
				color: p.style?.color,
			})
		}
		if (p.style) {
			setStyle(node.domElement, p.style)
			if (
				node.domElement.layoutNodeId !== undefined &&
				node.domElement.layoutTree
			) {
				applyLayoutStyle(
					node.domElement.layoutTree,
					node.domElement.layoutNodeId,
					p.style
				)
			}
		}

		if (p.internal_transform !== undefined) {
			node.domElement.internal_transform = p.internal_transform
		}

		if (p.internal_static !== undefined) {
			node.domElement.internal_static = p.internal_static
		}
	}

	apply(props, 'init')

	return {
		update(newProps: WolfiePropsPayload) {
			apply(newProps, 'update')
		},
		destroy() {
			// Mark as dead — purgeDeadWrapperNodes filters these during reconciliation.
			// Safety net for edge cases where Svelte's teardown doesn't call remove()
			// on every element (e.g., component-level unmount removes only outermost).
			node._wdead = true
		},
	}
}
//#endregion wolfieProps action
