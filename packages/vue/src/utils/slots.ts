import { Fragment, type VNode, type VNodeArrayChildren } from 'vue'

/**
 * Flattens a VNode array, resolving Fragments.
 */
export function flatten(children: VNodeArrayChildren): VNode[] {
	const result: VNode[] = []

	for (const child of children) {
		if (child === null || child === undefined) {
			continue
		}

		if (Array.isArray(child)) {
			result.push(...flatten(child))
			continue
		}

		if (typeof child !== 'object' || !('type' in child)) {
			// Handle string/number primitives if they appear (unlikely in this context but safe)
			result.push(child as unknown as VNode)
			continue
		}

		if (child.type === Fragment) {
			result.push(...flatten(child.children as VNodeArrayChildren))
			continue
		}

		result.push(child as VNode)
	}

	return result
}
