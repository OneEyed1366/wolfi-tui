import {
	WolfieNode,
	WolfieElement,
	WolfieText,
	WolfieComment,
	WolfieDocumentFragment,
	setNodeOpsConfig,
} from './wolfie-element.js'
import { type LayoutTree } from '@wolf-tui/core'

//#region Types

interface SavedGlobals {
	document: typeof globalThis.document | undefined
	Node: typeof globalThis.Node | undefined
	Element: typeof globalThis.Element | undefined
	HTMLElement: typeof globalThis.HTMLElement | undefined
	SVGElement: typeof globalThis.SVGElement | undefined
	Text: typeof globalThis.Text | undefined
	Comment: typeof globalThis.Comment | undefined
	DocumentFragment: typeof globalThis.DocumentFragment | undefined
	window: typeof globalThis.window | undefined
	navigator: typeof globalThis.navigator | undefined
	requestAnimationFrame: typeof globalThis.requestAnimationFrame | undefined
	cancelAnimationFrame: typeof globalThis.cancelAnimationFrame | undefined
	customElements: typeof globalThis.customElements | undefined
}

interface PatchConfig {
	getLayoutTree: () => LayoutTree
	getScheduleRender: () => (() => void) | null
}

//#endregion Types

//#region Saved state

let saved: SavedGlobals | null = null

//#endregion Saved state

//#region patchGlobals

/**
 * Replace globalThis.Node/Element/Text/Comment/DocumentFragment with our real
 * classes so Svelte's init_operations() finds proper prototype getters via
 * Object.getOwnPropertyDescriptor(Node.prototype, 'firstChild').
 *
 * With fragments:'tree' in svelte compiler, no HTML parser is needed —
 * Svelte generates from_tree() which calls document.createElement() directly.
 *
 * Must be called BEFORE Svelte's mount(). Call restoreGlobals() on cleanup.
 */
export function patchGlobals(patchConfig: PatchConfig): void {
	if (saved) return // Already patched

	// Wire up the element factory config
	setNodeOpsConfig(patchConfig)

	// Save originals
	saved = {
		document: globalThis.document,
		Node: globalThis.Node,
		Element: globalThis.Element,
		HTMLElement: globalThis.HTMLElement,
		SVGElement: globalThis.SVGElement,
		Text: globalThis.Text,
		Comment: globalThis.Comment,
		DocumentFragment: globalThis.DocumentFragment,
		window: globalThis.window,
		navigator: globalThis.navigator,
		requestAnimationFrame: globalThis.requestAnimationFrame,
		cancelAnimationFrame: globalThis.cancelAnimationFrame,
		customElements: globalThis.customElements,
	}

	//#region Template HTML parser (fallback for from_html() paths)

	/** Parse simple HTML from Svelte templates into wolfie nodes.
	 *  Svelte sends: <!---> comments, <wolfie-*> elements, text. */
	function parseHTMLIntoFragment(
		parent: WolfieDocumentFragment,
		html: string
	): void {
		let i = 0
		const stack: (WolfieDocumentFragment | WolfieElement)[] = [parent]

		function currentParent() {
			return stack[stack.length - 1]!
		}

		while (i < html.length) {
			if (html.startsWith('<!--', i)) {
				const end = html.indexOf('-->', i + 4)
				const text = end >= 0 ? html.slice(i + 4, end) : ''
				currentParent().appendChild(new WolfieComment(text))
				i = end >= 0 ? end + 3 : html.length
			} else if (html.startsWith('</', i)) {
				const end = html.indexOf('>', i + 2)
				i = end >= 0 ? end + 1 : html.length
				if (stack.length > 1) stack.pop()
			} else if (html[i] === '<') {
				const tagEnd = html.indexOf('>', i + 1)
				if (tagEnd < 0) break
				const tagContent = html.slice(i + 1, tagEnd)
				const selfClosing = tagContent.endsWith('/')
				const tagName = (selfClosing ? tagContent.slice(0, -1) : tagContent)
					.split(/[\s/]/)[0]!
					.toLowerCase()
				const normalized = tagName.startsWith('wolfie-')
					? tagName
					: `wolfie-${tagName}`
				const el = new WolfieElement(normalized)
				currentParent().appendChild(el)
				if (!selfClosing) {
					stack.push(el)
				}
				i = tagEnd + 1
			} else {
				const nextTag = html.indexOf('<', i)
				const text = nextTag >= 0 ? html.slice(i, nextTag) : html.slice(i)
				if (text) {
					currentParent().appendChild(new WolfieText(text))
				}
				i = nextTag >= 0 ? nextTag : html.length
			}
		}
	}

	/** Create a fragment that acts as a <template> element for Svelte's from_html() */
	function createTemplateFragment(): WolfieDocumentFragment {
		const frag = new WolfieDocumentFragment()
		Object.defineProperty(frag, 'innerHTML', {
			set(html: string) {
				parseHTMLIntoFragment(frag, html)
			},
			get() {
				return ''
			},
		})
		Object.defineProperty(frag, 'content', {
			get() {
				return frag
			},
		})
		return frag
	}

	//#endregion Template HTML parser

	//#region Document object

	const noop = () => {}

	const wolfieDocument = {
		createElement(tag: string): WolfieElement | WolfieDocumentFragment {
			// Template compat — Svelte uses <template> for from_html() fallback
			if (tag === 'template') {
				return createTemplateFragment()
			}
			const normalized = tag.startsWith('wolfie-') ? tag : `wolfie-${tag}`
			return new WolfieElement(normalized)
		},

		createElementNS(
			_ns: string | null,
			tag: string
		): WolfieElement | WolfieDocumentFragment {
			if (tag === 'template') {
				return createTemplateFragment()
			}
			const normalized = tag.startsWith('wolfie-') ? tag : `wolfie-${tag}`
			return new WolfieElement(normalized)
		},

		createTextNode(text: string): WolfieText {
			return new WolfieText(String(text ?? ''))
		},

		createComment(data: string): WolfieComment {
			return new WolfieComment(data ?? '')
		},

		createDocumentFragment(): WolfieDocumentFragment {
			return new WolfieDocumentFragment()
		},

		importNode(node: WolfieNode, deep?: boolean): WolfieNode {
			return node.cloneNode(deep ?? false)
		},

		addEventListener: noop,
		removeEventListener: noop,

		querySelector(_selector: string): null {
			return null
		},

		querySelectorAll(_selector: string): never[] {
			return []
		},

		get head(): WolfieElement {
			// Stub for svelte-head.js
			return new WolfieElement('wolfie-box')
		},

		get body(): WolfieElement {
			return new WolfieElement('wolfie-box')
		},

		get documentElement(): WolfieElement {
			return new WolfieElement('wolfie-box')
		},

		createEvent(type: string): Event {
			// infrastructure: minimal Event shim for Svelte's event system
			return { type, bubbles: false, cancelable: false } as unknown as Event
		},
	}

	//#endregion Document object

	//#region Apply patches — real classes, not proxies

	const g = globalThis as Record<string, unknown>

	// Core DOM class hierarchy — Svelte's init_operations() reads these
	// via Object.getOwnPropertyDescriptor(Node.prototype, 'firstChild') etc.
	g['Node'] = WolfieNode
	g['Element'] = WolfieElement
	g['HTMLElement'] = WolfieElement
	g['SVGElement'] = WolfieElement
	g['Text'] = WolfieText
	g['Comment'] = WolfieComment
	g['DocumentFragment'] = WolfieDocumentFragment

	g['document'] = wolfieDocument
	g['window'] = globalThis
	// Svelte's style.js calls window.getComputedStyle(); event delegation
	// calls window.addEventListener/removeEventListener. Stub them.
	g['getComputedStyle'] = () => ({})
	g['addEventListener'] = noop
	g['removeEventListener'] = noop

	try {
		g['navigator'] = { userAgent: 'wolfie' }
	} catch {
		Object.defineProperty(globalThis, 'navigator', {
			value: { userAgent: 'wolfie' },
			writable: true,
			configurable: true,
		})
	}

	g['requestAnimationFrame'] = (cb: () => void) => setTimeout(cb, 16)
	g['cancelAnimationFrame'] = (id: ReturnType<typeof setTimeout>) =>
		clearTimeout(id)
	g['customElements'] = { define: noop, get: () => undefined }

	//#endregion Apply patches
}

//#endregion patchGlobals

//#region restoreGlobals

/**
 * Restore all globals patched by patchGlobals(). Idempotent.
 */
export function restoreGlobals(): void {
	if (!saved) return

	const g = globalThis as Record<string, unknown>
	g['document'] = saved.document
	g['Node'] = saved.Node
	g['Element'] = saved.Element
	g['HTMLElement'] = saved.HTMLElement
	g['SVGElement'] = saved.SVGElement
	g['Text'] = saved.Text
	g['Comment'] = saved.Comment
	g['DocumentFragment'] = saved.DocumentFragment
	g['window'] = saved.window
	try {
		g['navigator'] = saved.navigator
	} catch {
		Object.defineProperty(globalThis, 'navigator', {
			value: saved.navigator,
			writable: true,
			configurable: true,
		})
	}
	g['requestAnimationFrame'] = saved.requestAnimationFrame
	g['cancelAnimationFrame'] = saved.cancelAnimationFrame
	g['customElements'] = saved.customElements

	saved = null
}

//#endregion restoreGlobals
