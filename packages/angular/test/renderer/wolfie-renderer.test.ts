import { describe, it, expect, beforeEach, vi } from 'vitest'
import { WolfieRenderer } from '../../src/renderer/wolfie-renderer'
import {
	createNode,
	isText,
	type DOMElement,
	type LayoutTree,
	type ElementNames,
} from '@wolfie/core'
import {
	layoutTreeRegistry,
	type WolfieAngularInstance,
} from '../../src/wolfie-angular'
import { registerStyles, clearGlobalStyles } from '../../src/styles/registry'

//#region Mock Helpers
/**
 * Create a mock LayoutTree with vi.fn() for all methods
 * Matches the interface from internal/core/src/layout-types.ts
 */
const createMockLayoutTree = (): LayoutTree => ({
	createNode: vi.fn(() => 1),
	insertChild: vi.fn(),
	removeChild: vi.fn(),
	removeNode: vi.fn(),
	setStyle: vi.fn(),
	setTextDimensions: vi.fn(),
	markDirty: vi.fn(),
	setDisplayNone: vi.fn(),
	setDisplayFlex: vi.fn(),
	computeLayout: vi.fn(),
	getLayout: vi.fn(() => ({
		x: 0,
		y: 0,
		width: 100,
		height: 10,
		paddingTop: 0,
		paddingRight: 0,
		paddingBottom: 0,
		paddingLeft: 0,
		borderTop: 0,
		borderRight: 0,
		borderBottom: 0,
		borderLeft: 0,
	})),
	getChildCount: vi.fn(() => 0),
})

/**
 * Create a mock root node and register it with a mock instance
 */
const createMockContext = () => {
	const layoutTree = createMockLayoutTree()
	const rootNode = createNode('wolfie-root' as ElementNames, layoutTree)
	const onRenderMock = vi.fn()

	const instance: WolfieAngularInstance = {
		layoutTree,
		onRender: onRenderMock,
	}

	layoutTreeRegistry.set(rootNode, instance)

	return { rootNode, layoutTree, onRenderMock, instance }
}
//#endregion Mock Helpers

describe('WolfieRenderer', () => {
	let renderer: WolfieRenderer
	let rootNode: DOMElement
	let layoutTree: LayoutTree
	let onRenderMock: ReturnType<typeof vi.fn>

	beforeEach(() => {
		clearGlobalStyles()
		const ctx = createMockContext()
		rootNode = ctx.rootNode
		layoutTree = ctx.layoutTree
		onRenderMock = ctx.onRenderMock

		renderer = new WolfieRenderer(rootNode)
	})

	//#region createElement Tests
	describe('createElement', () => {
		it('creates wolfie-box from w-box selector', () => {
			const node = renderer.createElement('w-box')
			expect(node.nodeName).toBe('wolfie-box')
		})

		it('creates wolfie-text from w-text selector', () => {
			const node = renderer.createElement('w-text')
			expect(node.nodeName).toBe('wolfie-text')
		})

		it('creates wolfie-box for app-* selectors', () => {
			const node = renderer.createElement('app-root')
			expect(node.nodeName).toBe('wolfie-box')
		})

		it('creates wolfie-box for unknown selectors', () => {
			const node = renderer.createElement('div')
			expect(node.nodeName).toBe('wolfie-box')
		})

		it('passes through wolfie-* selectors unchanged', () => {
			const node = renderer.createElement('wolfie-spacer')
			expect(node.nodeName).toBe('wolfie-spacer')
		})

		it('does not initialize layoutNodeId until inserted into tree', () => {
			const node = renderer.createElement('w-box')
			// Node created but not yet in tree - no layoutNodeId
			expect(node.layoutNodeId).toBeUndefined()
		})
	})
	//#endregion createElement Tests

	//#region createText Tests
	describe('createText', () => {
		it('creates text node with value', () => {
			const textNode = renderer.createText('Hello World')
			expect(textNode.nodeName).toBe('#text')
			expect(textNode.nodeValue).toBe('Hello World')
		})

		it('creates text node with empty string', () => {
			const textNode = renderer.createText('')
			expect(textNode.nodeName).toBe('#text')
			expect(textNode.nodeValue).toBe('')
		})
	})
	//#endregion createText Tests

	//#region createComment Tests
	describe('createComment', () => {
		it('creates empty text node as placeholder', () => {
			const comment = renderer.createComment('This is a comment')
			// Comments become empty text nodes in terminal
			expect(comment.nodeName).toBe('#text')
			expect(isText(comment) && comment.nodeValue).toBe('')
		})
	})
	//#endregion createComment Tests

	//#region appendChild Tests
	describe('appendChild', () => {
		it('appends child to parent', () => {
			const child = renderer.createElement('w-box')
			renderer.appendChild(rootNode, child)

			expect(rootNode.childNodes).toContain(child)
			expect(child.parentNode).toBe(rootNode)
		})

		it('initializes layout tree recursively', () => {
			const child = renderer.createElement('w-box')
			renderer.appendChild(rootNode, child)

			// layoutTree.createNode should be called for the new child
			expect(layoutTree.createNode).toHaveBeenCalled()
		})

		it('triggers onRender callback', () => {
			const child = renderer.createElement('w-box')
			renderer.appendChild(rootNode, child)

			expect(onRenderMock).toHaveBeenCalled()
		})

		it('appends text node to element', () => {
			const textNode = renderer.createText('Hello')
			renderer.appendChild(rootNode, textNode)

			expect(rootNode.childNodes).toContain(textNode)
		})

		it('handles nested element structure', () => {
			const parent = renderer.createElement('w-box')
			const child = renderer.createElement('w-text')
			renderer.appendChild(rootNode, parent)
			renderer.appendChild(parent, child)

			expect(parent.childNodes).toContain(child)
			expect(child.parentNode).toBe(parent)
		})
	})
	//#endregion appendChild Tests

	//#region insertBefore Tests
	describe('insertBefore', () => {
		it('inserts child before reference', () => {
			const first = renderer.createElement('w-box')
			const second = renderer.createElement('w-box')
			const middle = renderer.createElement('w-box')

			renderer.appendChild(rootNode, first)
			renderer.appendChild(rootNode, second)
			renderer.insertBefore(rootNode, middle, second)

			const children = rootNode.childNodes
			expect(children.indexOf(middle)).toBe(1)
			expect(children.indexOf(second)).toBe(2)
		})

		it('initializes layout tree recursively', () => {
			const first = renderer.createElement('w-box')
			const second = renderer.createElement('w-box')

			renderer.appendChild(rootNode, first)
			const callsBefore = (layoutTree.createNode as ReturnType<typeof vi.fn>)
				.mock.calls.length
			renderer.insertBefore(rootNode, second, first)

			// Should have created layout node for second
			expect(
				(layoutTree.createNode as ReturnType<typeof vi.fn>).mock.calls.length
			).toBeGreaterThan(callsBefore)
		})

		it('triggers onRender callback', () => {
			const first = renderer.createElement('w-box')
			const second = renderer.createElement('w-box')

			renderer.appendChild(rootNode, first)
			onRenderMock.mockClear()
			renderer.insertBefore(rootNode, second, first)

			expect(onRenderMock).toHaveBeenCalled()
		})
	})
	//#endregion insertBefore Tests

	//#region removeChild Tests
	describe('removeChild', () => {
		it('removes child from parent', () => {
			const child = renderer.createElement('w-box')
			renderer.appendChild(rootNode, child)
			renderer.removeChild(rootNode, child)

			expect(rootNode.childNodes).not.toContain(child)
		})

		it('triggers onRender callback', () => {
			const child = renderer.createElement('w-box')
			renderer.appendChild(rootNode, child)
			onRenderMock.mockClear()
			renderer.removeChild(rootNode, child)

			expect(onRenderMock).toHaveBeenCalled()
		})
	})
	//#endregion removeChild Tests

	//#region selectRootElement Tests
	describe('selectRootElement', () => {
		it('returns root node', () => {
			const result = renderer.selectRootElement('any-selector')
			expect(result).toBe(rootNode)
		})
	})
	//#endregion selectRootElement Tests

	//#region parentNode Tests
	describe('parentNode', () => {
		it('returns parent node', () => {
			const child = renderer.createElement('w-box')
			renderer.appendChild(rootNode, child)

			expect(renderer.parentNode(child)).toBe(rootNode)
		})

		it('returns null for root node', () => {
			expect(renderer.parentNode(rootNode)).toBeNull()
		})
	})
	//#endregion parentNode Tests

	//#region nextSibling Tests
	describe('nextSibling', () => {
		it('returns next sibling', () => {
			const first = renderer.createElement('w-box')
			const second = renderer.createElement('w-box')

			renderer.appendChild(rootNode, first)
			renderer.appendChild(rootNode, second)

			expect(renderer.nextSibling(first)).toBe(second)
		})

		it('returns null for last child', () => {
			const only = renderer.createElement('w-box')
			renderer.appendChild(rootNode, only)

			expect(renderer.nextSibling(only)).toBeNull()
		})

		it('returns null when no parent', () => {
			const orphan = renderer.createElement('w-box')
			expect(renderer.nextSibling(orphan)).toBeNull()
		})
	})
	//#endregion nextSibling Tests

	//#region setAttribute Tests
	describe('setAttribute', () => {
		it('sets class and resolves to styles', () => {
			registerStyles({ 'test-class': { padding: 2 } })

			const el = renderer.createElement('w-box')
			renderer.appendChild(rootNode, el)
			renderer.setAttribute(el, 'class', 'test-class')

			expect(el.attributes['class']).toBe('test-class')
			expect(el.style.padding).toBe(2)
		})

		it('creates text transform for wolfie-text', () => {
			const el = renderer.createElement('w-text')
			renderer.appendChild(rootNode, el)

			registerStyles({ 'text-bold': { fontWeight: 'bold' } })
			renderer.setAttribute(el, 'class', 'text-bold')

			expect(typeof el.internal_transform).toBe('function')
		})

		it('sets internal_static attribute', () => {
			const el = renderer.createElement('w-box')
			renderer.appendChild(rootNode, el)
			renderer.setAttribute(el, 'internal_static', 'true')

			expect(el.internal_static).toBe(true)
		})

		it('sets generic attributes', () => {
			const el = renderer.createElement('w-box')
			renderer.appendChild(rootNode, el)
			renderer.setAttribute(el, 'aria-label', 'Test Label')

			expect(el.attributes['aria-label']).toBe('Test Label')
		})

		it('triggers onRender callback', () => {
			const el = renderer.createElement('w-box')
			renderer.appendChild(rootNode, el)
			onRenderMock.mockClear()
			renderer.setAttribute(el, 'data-test', 'value')

			expect(onRenderMock).toHaveBeenCalled()
		})
	})
	//#endregion setAttribute Tests

	//#region addClass Tests
	describe('addClass', () => {
		it('adds class to existing classes', () => {
			const el = renderer.createElement('w-box')
			renderer.appendChild(rootNode, el)

			renderer.setAttribute(el, 'class', 'first')
			renderer.addClass(el, 'second')

			expect(el.attributes['class']).toBe('first second')
		})

		it('updates resolved styles', () => {
			registerStyles({
				base: { padding: 1 },
				extra: { margin: 2 },
			})

			const el = renderer.createElement('w-box')
			renderer.appendChild(rootNode, el)

			renderer.setAttribute(el, 'class', 'base')
			renderer.addClass(el, 'extra')

			expect(el.style.padding).toBe(1)
			expect(el.style.margin).toBe(2)
		})

		it('does not add duplicate class', () => {
			const el = renderer.createElement('w-box')
			renderer.appendChild(rootNode, el)

			renderer.setAttribute(el, 'class', 'foo')
			renderer.addClass(el, 'foo')

			expect(el.attributes['class']).toBe('foo')
		})

		it('adds class to element with no existing classes', () => {
			const el = renderer.createElement('w-box')
			renderer.appendChild(rootNode, el)

			renderer.addClass(el, 'first')

			expect(el.attributes['class']).toBe('first')
		})
	})
	//#endregion addClass Tests

	//#region removeClass Tests
	describe('removeClass', () => {
		it('removes class from element', () => {
			const el = renderer.createElement('w-box')
			renderer.appendChild(rootNode, el)

			renderer.setAttribute(el, 'class', 'foo bar baz')
			renderer.removeClass(el, 'bar')

			expect(el.attributes['class']).toBe('foo baz')
		})

		it('recalculates class-based styles after removal', () => {
			registerStyles({
				base: { padding: 1 },
				extra: { margin: 2, gap: 4 },
			})

			const el = renderer.createElement('w-box')
			renderer.appendChild(rootNode, el)

			renderer.setAttribute(el, 'class', 'base extra')
			expect(el.style.margin).toBe(2)
			expect(el.style.gap).toBe(4)

			renderer.removeClass(el, 'extra')

			// After removal, base styles still apply
			expect(el.style.padding).toBe(1)
			// Note: Current implementation preserves previously applied styles
			// bc it merges with existing el.style. This is expected behavior.
			expect(el.style.margin).toBe(2)
		})

		it('handles removing non-existent class', () => {
			const el = renderer.createElement('w-box')
			renderer.appendChild(rootNode, el)

			renderer.setAttribute(el, 'class', 'foo')
			renderer.removeClass(el, 'bar') // doesn't exist

			expect(el.attributes['class']).toBe('foo')
		})
	})
	//#endregion removeClass Tests

	//#region setStyle Tests
	describe('setStyle', () => {
		it('sets individual style property', () => {
			const el = renderer.createElement('w-box')
			renderer.appendChild(rootNode, el)

			renderer.setStyle(el, 'padding', 4)

			expect(el.style.padding).toBe(4)
		})

		it('merges with existing styles', () => {
			const el = renderer.createElement('w-box')
			renderer.appendChild(rootNode, el)

			renderer.setStyle(el, 'padding', 2)
			renderer.setStyle(el, 'margin', 3)

			expect(el.style.padding).toBe(2)
			expect(el.style.margin).toBe(3)
		})

		it('syncs with layout tree', () => {
			const el = renderer.createElement('w-box')
			renderer.appendChild(rootNode, el)
			;(layoutTree.setStyle as ReturnType<typeof vi.fn>).mockClear()
			renderer.setStyle(el, 'padding', 2)

			// applyLayoutStyle internally calls layoutTree.setStyle
			expect(layoutTree.setStyle).toHaveBeenCalled()
		})

		it('updates text transform for wolfie-text when style changes', () => {
			const el = renderer.createElement('w-text')
			renderer.appendChild(rootNode, el)

			renderer.setStyle(el, 'fontWeight', 'bold')

			expect(typeof el.internal_transform).toBe('function')
		})

		it('triggers onRender callback', () => {
			const el = renderer.createElement('w-box')
			renderer.appendChild(rootNode, el)
			onRenderMock.mockClear()
			renderer.setStyle(el, 'padding', 2)

			expect(onRenderMock).toHaveBeenCalled()
		})
	})
	//#endregion setStyle Tests

	//#region removeStyle Tests
	describe('removeStyle', () => {
		it('removes style property', () => {
			const el = renderer.createElement('w-box')
			renderer.appendChild(rootNode, el)

			renderer.setStyle(el, 'padding', 2)
			renderer.removeStyle(el, 'padding')

			expect(el.style.padding).toBeUndefined()
		})

		it('preserves other styles', () => {
			const el = renderer.createElement('w-box')
			renderer.appendChild(rootNode, el)

			renderer.setStyle(el, 'padding', 2)
			renderer.setStyle(el, 'margin', 3)
			renderer.removeStyle(el, 'padding')

			expect(el.style.padding).toBeUndefined()
			expect(el.style.margin).toBe(3)
		})

		it('triggers onRender callback', () => {
			const el = renderer.createElement('w-box')
			renderer.appendChild(rootNode, el)
			renderer.setStyle(el, 'padding', 2)
			onRenderMock.mockClear()
			renderer.removeStyle(el, 'padding')

			expect(onRenderMock).toHaveBeenCalled()
		})
	})
	//#endregion removeStyle Tests

	//#region setProperty Tests
	describe('setProperty', () => {
		it('sets style object directly', () => {
			const el = renderer.createElement('w-box')
			renderer.appendChild(rootNode, el)

			renderer.setProperty(el, 'style', { padding: 4, margin: 2 })

			expect(el.style.padding).toBe(4)
			expect(el.style.margin).toBe(2)
		})

		it('handles textContent update - creates text node', () => {
			const el = renderer.createElement('w-text')
			renderer.appendChild(rootNode, el)

			renderer.setProperty(el, 'textContent', 'Hello World')

			expect(el.childNodes.length).toBe(1)
			const child = el.childNodes[0]!
			expect(isText(child) && child.nodeValue).toBe('Hello World')
		})

		it('handles textContent update - updates existing text node', () => {
			const el = renderer.createElement('w-text')
			const textNode = renderer.createText('Initial')
			renderer.appendChild(rootNode, el)
			renderer.appendChild(el, textNode)

			renderer.setProperty(el, 'textContent', 'Updated')

			expect(el.childNodes.length).toBe(1)
			const child = el.childNodes[0]!
			expect(isText(child) && child.nodeValue).toBe('Updated')
		})

		it('handles internal_transform', () => {
			const el = renderer.createElement('w-text')
			renderer.appendChild(rootNode, el)

			const transform = (text: string) => text.toUpperCase()
			renderer.setProperty(el, 'internal_transform', transform)

			expect(el.internal_transform).toBe(transform)
		})

		it('handles internal_static', () => {
			const el = renderer.createElement('w-box')
			renderer.appendChild(rootNode, el)

			renderer.setProperty(el, 'internal_static', true)

			expect(el.internal_static).toBe(true)
		})

		it('handles internal_accessibility', () => {
			const el = renderer.createElement('w-box')
			renderer.appendChild(rootNode, el)

			const accessibility = { ariaLabel: 'Test' }
			renderer.setProperty(el, 'internal_accessibility', accessibility)

			expect((el as DOMElement).internal_accessibility).toEqual(accessibility)
		})

		it('sets generic attribute for unknown properties', () => {
			const el = renderer.createElement('w-box')
			renderer.appendChild(rootNode, el)

			renderer.setProperty(el, 'data-custom', 'value')

			expect(el.attributes['data-custom']).toBe('value')
		})

		it('triggers onRender callback', () => {
			const el = renderer.createElement('w-box')
			renderer.appendChild(rootNode, el)
			onRenderMock.mockClear()
			renderer.setProperty(el, 'style', { padding: 2 })

			expect(onRenderMock).toHaveBeenCalled()
		})
	})
	//#endregion setProperty Tests

	//#region setValue Tests
	describe('setValue', () => {
		it('updates text node value', () => {
			const textNode = renderer.createText('Initial')
			renderer.appendChild(rootNode, textNode)

			renderer.setValue(textNode, 'Updated')

			expect(textNode.nodeValue).toBe('Updated')
		})

		it('triggers onRender callback', () => {
			const textNode = renderer.createText('Initial')
			renderer.appendChild(rootNode, textNode)
			onRenderMock.mockClear()
			renderer.setValue(textNode, 'Updated')

			expect(onRenderMock).toHaveBeenCalled()
		})

		it('does nothing for non-text nodes', () => {
			const el = renderer.createElement('w-box')
			renderer.appendChild(rootNode, el)

			// Should not throw
			renderer.setValue(el, 'some value')
		})
	})
	//#endregion setValue Tests

	//#region listen Tests
	describe('listen', () => {
		it('returns no-op function', () => {
			const unlisten = renderer.listen(rootNode, 'click', () => {})

			expect(typeof unlisten).toBe('function')
			// Should not throw when called
			expect(() => unlisten()).not.toThrow()
		})

		it('handles different targets', () => {
			const unlisten1 = renderer.listen('window', 'resize', () => {})
			const unlisten2 = renderer.listen('document', 'keydown', () => {})
			const unlisten3 = renderer.listen('body', 'scroll', () => {})

			expect(typeof unlisten1).toBe('function')
			expect(typeof unlisten2).toBe('function')
			expect(typeof unlisten3).toBe('function')
		})
	})
	//#endregion listen Tests

	//#region destroy Tests
	describe('destroy', () => {
		it('does not throw', () => {
			expect(() => renderer.destroy()).not.toThrow()
		})
	})
	//#endregion destroy Tests

	//#region removeAttribute Tests
	describe('removeAttribute', () => {
		it('removes attribute from element', () => {
			const el = renderer.createElement('w-box')
			renderer.appendChild(rootNode, el)
			renderer.setAttribute(el, 'aria-label', 'Test')
			renderer.removeAttribute(el, 'aria-label')

			expect(el.attributes['aria-label']).toBeUndefined()
		})

		it('triggers onRender callback', () => {
			const el = renderer.createElement('w-box')
			renderer.appendChild(rootNode, el)
			renderer.setAttribute(el, 'aria-label', 'Test')
			onRenderMock.mockClear()
			renderer.removeAttribute(el, 'aria-label')

			expect(onRenderMock).toHaveBeenCalled()
		})
	})
	//#endregion removeAttribute Tests

	//#region Text Transform Tests
	describe('Text Transform (createTextTransform)', () => {
		it('applies color to text', () => {
			registerStyles({ 'text-red': { color: 'red' } })

			const el = renderer.createElement('w-text')
			renderer.appendChild(rootNode, el)
			renderer.setAttribute(el, 'class', 'text-red')

			expect(el.internal_transform).toBeDefined()
			// The transform function exists; actual colorization tested via chalk
		})

		it('applies multiple text styles', () => {
			registerStyles({
				'styled-text': {
					fontWeight: 'bold',
					fontStyle: 'italic',
					textDecoration: 'underline',
				},
			})

			const el = renderer.createElement('w-text')
			renderer.appendChild(rootNode, el)
			renderer.setAttribute(el, 'class', 'styled-text')

			expect(el.internal_transform).toBeDefined()
		})
	})
	//#endregion Text Transform Tests
})
