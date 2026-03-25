import {
	createNode,
	createTextNode,
	appendChildNode,
	insertBeforeNode,
	removeChildNode,
	setAttribute,
	setStyle,
	setTextNodeValue,
	applyLayoutStyle,
	logger,
	type DOMElement,
	type TextNode,
	type LayoutTree,
	type ElementNames,
} from '@wolfie/core'
import type { Styles } from '@wolfie/core'

//#region Type guards

const VALID_ELEMENT_NAMES = new Set<string>([
	'wolfie-root',
	'wolfie-box',
	'wolfie-text',
	'wolfie-virtual-text',
])

function isElementName(tag: string): tag is ElementNames {
	return VALID_ELEMENT_NAMES.has(tag)
}

function isNodeConnected(node: WolfieNode): boolean {
	let current: WolfieNode | null = node
	while (current) {
		if (current.nodeName === 'wolfie-root') return true
		current = current._wparent
	}
	return false
}

//#endregion Type guards

//#region Style proxy type

/** Proxy target shape for the style property — satisfies Svelte's style access patterns */
interface StyleProxy {
	cssText: string
	[key: string]: string
}

//#endregion Style proxy type

//#region Config

interface NodeOpsConfig {
	getLayoutTree: () => LayoutTree
	getScheduleRender: () => (() => void) | null
}

let config: NodeOpsConfig | undefined

export function setNodeOpsConfig(cfg: NodeOpsConfig): void {
	config = cfg
}

function getLayoutTree(): LayoutTree {
	if (!config)
		throw new Error(
			'NodeOpsConfig not set — call setNodeOpsConfig() before mount()'
		)
	return config.getLayoutTree()
}

function scheduleRender(): void {
	const fn = config?.getScheduleRender()
	if (fn) {
		if (logger.enabled) {
			logger.log({
				ts: performance.now(),
				cat: 'svelte',
				op: 'scheduleRender',
			})
		}
		fn()
	}
}

//#endregion Config

//#region WolfieNode

/**
 * Base class for all wolfie DOM wrapper nodes. Assigned to globalThis.Node so
 * Svelte's init_operations() finds our prototype getters via
 * Object.getOwnPropertyDescriptor(Node.prototype, 'firstChild').
 *
 * All traversal getters, ChildNode methods (remove, before, after, replaceWith),
 * and ParentNode methods (appendChild, insertBefore, removeChild, append) live
 * here. WolfieElement overrides the core-DOM delegation hooks.
 */
export abstract class WolfieNode {
	// Static constants matching DOM spec — Svelte reads these from Node
	static readonly ELEMENT_NODE = 1
	static readonly TEXT_NODE = 3
	static readonly COMMENT_NODE = 8
	static readonly DOCUMENT_FRAGMENT_NODE = 11

	_wchildren: WolfieNode[] = []
	_wparent: WolfieNode | null = null
	_wdead = false

	abstract readonly nodeType: number
	abstract readonly nodeName: string

	// Svelte V8 shape hints — set on prototype so V8 sees them early
	declare __click: unknown
	declare __className: unknown
	declare __attributes: unknown
	declare __style: unknown
	declare __e: unknown

	//#region Navigation — prototype getters found by Object.getOwnPropertyDescriptor

	get firstChild(): WolfieNode | null {
		return this._wchildren[0] ?? null
	}

	get lastChild(): WolfieNode | null {
		return this._wchildren[this._wchildren.length - 1] ?? null
	}

	get nextSibling(): WolfieNode | null {
		if (!this._wparent) return null
		const siblings = this._wparent._wchildren
		const idx = siblings.indexOf(this)
		return siblings[idx + 1] ?? null
	}

	get previousSibling(): WolfieNode | null {
		if (!this._wparent) return null
		const siblings = this._wparent._wchildren
		const idx = siblings.indexOf(this)
		return idx > 0 ? (siblings[idx - 1] ?? null) : null
	}

	get parentNode(): WolfieNode | null {
		return this._wparent
	}

	get parentElement(): WolfieNode | null {
		return this._wparent
	}

	get childNodes(): WolfieNode[] {
		return this._wchildren
	}

	get isConnected(): boolean {
		return isNodeConnected(this)
	}

	get ownerDocument(): unknown {
		return globalThis.document
	}

	//#endregion Navigation

	//#region Mutation — ParentNode + ChildNode methods

	appendChild(child: WolfieNode): WolfieNode {
		// Fragment: move children, not the fragment itself (standard DOM behavior)
		if (child instanceof WolfieDocumentFragment) {
			const kids = [...child._wchildren]
			for (const kid of kids) {
				this.appendChild(kid)
			}
			return child
		}

		// Detach from current parent — triggers core DOM + Taffy cleanup
		if (child._wparent) {
			child._wparent.removeChild(child)
		}

		child._wparent = this
		this._wchildren.push(child)

		// Delegate to core DOM if both are elements/text
		this._coreDomAppend(child)

		return child
	}

	insertBefore(newChild: WolfieNode, refChild: WolfieNode | null): WolfieNode {
		if (!refChild) return this.appendChild(newChild)

		// Fragment: insert all children before refChild
		if (newChild instanceof WolfieDocumentFragment) {
			const kids = [...newChild._wchildren]
			for (const kid of kids) {
				this.insertBefore(kid, refChild)
			}
			return newChild
		}

		// Detach from current parent
		if (newChild._wparent) {
			newChild._wparent.removeChild(newChild)
		}

		const idx = this._wchildren.indexOf(refChild)
		if (idx >= 0) {
			this._wchildren.splice(idx, 0, newChild)
		} else {
			this._wchildren.push(newChild)
		}
		newChild._wparent = this

		// Delegate to core DOM
		this._coreDomInsertBefore(newChild, refChild)

		return newChild
	}

	removeChild(child: WolfieNode): WolfieNode {
		const idx = this._wchildren.indexOf(child)
		if (idx >= 0) {
			this._wchildren.splice(idx, 1)
		}
		child._wparent = null

		// Delegate to core DOM
		this._coreDomRemove(child)

		return child
	}

	replaceChild(newChild: WolfieNode, oldChild: WolfieNode): WolfieNode {
		this.insertBefore(newChild, oldChild)
		this.removeChild(oldChild)
		return oldChild
	}

	/** ParentNode.append — Svelte calls element.append(child) heavily */
	append(...nodes: Array<WolfieNode | string>): void {
		for (const node of nodes) {
			if (typeof node === 'string') {
				this.appendChild(new WolfieText(node))
			} else {
				this.appendChild(node)
			}
		}
	}

	/** ParentNode.prepend */
	prepend(...nodes: Array<WolfieNode | string>): void {
		const ref = this.firstChild
		for (const node of nodes) {
			const child = typeof node === 'string' ? new WolfieText(node) : node
			this.insertBefore(child, ref)
		}
	}

	/** ChildNode.before — Svelte calls anchor.before(node) for insertion */
	before(...nodes: Array<WolfieNode | string>): void {
		if (!this._wparent) return
		for (const node of nodes) {
			const child = typeof node === 'string' ? new WolfieText(node) : node
			this._wparent.insertBefore(child, this)
		}
	}

	/** ChildNode.after — Svelte calls node.after(text) */
	after(...nodes: Array<WolfieNode | string>): void {
		if (!this._wparent) return
		let ref = this.nextSibling
		for (const node of nodes) {
			const child = typeof node === 'string' ? new WolfieText(node) : node
			this._wparent.insertBefore(child, ref)
			// After inserting, the next insert goes after the one we just inserted
			ref = child.nextSibling
		}
	}

	/** ChildNode.remove — THE key fix for Svelte's remove_effect_dom() */
	remove(): void {
		if (this._wparent) {
			this._wparent.removeChild(this)
		}
	}

	/** ChildNode.replaceWith */
	replaceWith(...nodes: Array<WolfieNode | string>): void {
		if (!this._wparent) return
		const parent = this._wparent
		const ref = this.nextSibling
		parent.removeChild(this)
		for (const node of nodes) {
			const child = typeof node === 'string' ? new WolfieText(node) : node
			parent.insertBefore(child, ref)
		}
	}

	contains(node: WolfieNode | null): boolean {
		if (!node) return false
		let current: WolfieNode | null = node
		while (current) {
			if (current === this) return true
			current = current._wparent
		}
		return false
	}

	cloneNode(deep?: boolean): WolfieNode {
		return this._cloneImpl(deep ?? false)
	}

	get textContent(): string {
		if (this instanceof WolfieText) return this.data
		return this._wchildren.map((c) => c.textContent).join('')
	}

	set textContent(value: string) {
		// Remove all children
		while (this._wchildren.length > 0) {
			const child = this._wchildren[0]
			if (child) this.removeChild(child)
		}
		if (value) {
			this.appendChild(new WolfieText(value))
		}
	}

	//#endregion Mutation

	//#region Protected — override in subclasses for core DOM delegation

	protected _coreDomAppend(_child: WolfieNode): void {
		// Default: no-op for comment/fragment
	}

	protected _coreDomInsertBefore(
		_newChild: WolfieNode,
		_refChild: WolfieNode
	): void {
		// Default: no-op
	}

	protected _coreDomRemove(_child: WolfieNode): void {
		// Default: no-op
	}

	protected abstract _cloneImpl(deep: boolean): WolfieNode

	//#endregion Protected
}

//#endregion WolfieNode

//#region WolfieElement

/**
 * Wraps a core DOMElement. Each WolfieElement owns one DOMElement from @wolfie/core.
 * All attribute/style/child operations delegate to the core DOM API.
 * Assigned to globalThis.Element and globalThis.HTMLElement.
 */
export class WolfieElement extends WolfieNode {
	readonly nodeType = 1
	readonly nodeName: string
	readonly domElement: DOMElement

	// Event handler storage
	private _listeners = new Map<
		string,
		Set<EventListenerOrEventListenerObject>
	>()

	constructor(tagName: string, domEl?: DOMElement) {
		super()
		this.nodeName = tagName
		if (!isElementName(tagName)) {
			throw new Error(`Unknown wolfie element name: "${tagName}"`)
		}
		this.domElement = domEl ?? createNode(tagName, getLayoutTree())

		if (logger.enabled) {
			logger.log({
				ts: performance.now(),
				cat: 'svelte',
				op: 'createElement',
				name: tagName,
				nodeId: this.domElement.layoutNodeId,
			})
		}
	}

	//#region Attributes

	setAttribute(key: string, value: string): void {
		setAttribute(this.domElement, key, value)
	}

	getAttribute(key: string): string | null {
		const val = this.domElement.attributes[key]
		if (val === undefined) return null
		return String(val)
	}

	removeAttribute(key: string): void {
		delete this.domElement.attributes[key]
	}

	setAttributeNS(_ns: string | null, key: string, value: string): void {
		this.setAttribute(key, value)
	}

	hasAttribute(key: string): boolean {
		return key in this.domElement.attributes
	}

	//#endregion Attributes

	//#region className / classList

	get className(): string {
		const cn = this.domElement.attributes['className']
		return cn !== undefined ? String(cn) : ''
	}

	set className(value: string) {
		setAttribute(this.domElement, 'className', value)
	}

	get classList(): {
		add: (...tokens: string[]) => void
		remove: (...tokens: string[]) => void
		toggle: (token: string, force?: boolean) => boolean
		contains: (token: string) => boolean
	} {
		return {
			add: (...tokens: string[]) => {
				const current = new Set(this.className.split(/\s+/).filter(Boolean))
				for (const t of tokens) current.add(t)
				this.className = [...current].join(' ')
			},
			remove: (...tokens: string[]) => {
				const current = new Set(this.className.split(/\s+/).filter(Boolean))
				for (const t of tokens) current.delete(t)
				this.className = [...current].join(' ')
			},
			toggle: (token: string, force?: boolean): boolean => {
				const current = new Set(this.className.split(/\s+/).filter(Boolean))
				const shouldAdd = force !== undefined ? force : !current.has(token)
				if (shouldAdd) {
					current.add(token)
				} else {
					current.delete(token)
				}
				this.className = [...current].join(' ')
				return shouldAdd
			},
			contains: (token: string): boolean => {
				return this.className.split(/\s+/).includes(token)
			},
		}
	}

	//#endregion className / classList

	//#region Style proxy

	get style(): StyleProxy {
		const domEl = this.domElement
		const target: StyleProxy = Object.create(null)
		target.cssText = ''
		const handler: ProxyHandler<StyleProxy> = {
			set(_target, prop, value) {
				if (typeof prop !== 'string') return true
				const merged: Styles = { ...domEl.style, [prop]: value }
				setStyle(domEl, merged)
				if (domEl.layoutNodeId !== undefined && domEl.layoutTree) {
					applyLayoutStyle(domEl.layoutTree, domEl.layoutNodeId, merged)
				}
				scheduleRender()
				return true
			},
			get(_target, prop) {
				if (prop === 'cssText') return ''
				if (prop === 'setProperty') {
					return (key: string, value: string) => {
						const merged: Styles = { ...domEl.style, [key]: value }
						setStyle(domEl, merged)
						if (domEl.layoutNodeId !== undefined && domEl.layoutTree) {
							applyLayoutStyle(domEl.layoutTree, domEl.layoutNodeId, merged)
						}
						scheduleRender()
					}
				}
				if (typeof prop === 'string') {
					const val = Reflect.get(domEl.style, prop)
					return val !== undefined ? String(val) : ''
				}
				return undefined
			},
		}
		return new Proxy(target, handler)
	}

	//#endregion Style proxy

	//#region Events

	addEventListener(
		type: string,
		listener: EventListenerOrEventListenerObject
	): void {
		let set = this._listeners.get(type)
		if (!set) {
			set = new Set()
			this._listeners.set(type, set)
		}
		set.add(listener)
	}

	removeEventListener(
		type: string,
		listener: EventListenerOrEventListenerObject
	): void {
		const set = this._listeners.get(type)
		if (set) {
			set.delete(listener)
			if (set.size === 0) this._listeners.delete(type)
		}
	}

	dispatchEvent(event: Event): boolean {
		const set = this._listeners.get(event.type)
		if (set) {
			for (const listener of set) {
				if (typeof listener === 'function') {
					listener(event)
				} else {
					listener.handleEvent(event)
				}
			}
		}
		return true
	}

	//#endregion Events

	//#region Misc DOM compat

	getBoundingClientRect(): {
		x: number
		y: number
		width: number
		height: number
		top: number
		right: number
		bottom: number
		left: number
	} {
		return {
			x: 0,
			y: 0,
			width: 0,
			height: 0,
			top: 0,
			right: 0,
			bottom: 0,
			left: 0,
		}
	}

	get innerHTML(): string {
		return ''
	}

	set innerHTML(_value: string) {
		// No-op stub — with fragments:'tree', Svelte doesn't use innerHTML
	}

	/** Template compat — `content` returns self so `template.content.cloneNode()` works */
	get content(): WolfieElement {
		return this
	}

	get internal_transform() {
		return this.domElement.internal_transform
	}

	set internal_transform(value) {
		this.domElement.internal_transform = value
	}

	get internal_static() {
		return this.domElement.internal_static
	}

	set internal_static(value) {
		this.domElement.internal_static = value
	}

	get internal_accessibility() {
		return this.domElement.internal_accessibility
	}

	set internal_accessibility(value) {
		this.domElement.internal_accessibility = value
	}

	//#endregion Misc DOM compat

	//#region Core DOM delegation

	protected override _coreDomAppend(child: WolfieNode): void {
		const lt = getLayoutTree()
		if (child instanceof WolfieElement) {
			appendChildNode(this.domElement, child.domElement, lt)
		} else if (child instanceof WolfieText) {
			appendChildNode(this.domElement, child.textNode, lt)
		}
		// WolfieComment: no core DOM node, just tracked in _wchildren for navigation
		scheduleRender()
	}

	protected override _coreDomInsertBefore(
		newChild: WolfieNode,
		refChild: WolfieNode
	): void {
		const lt = getLayoutTree()
		const refDomNode =
			refChild instanceof WolfieElement
				? refChild.domElement
				: refChild instanceof WolfieText
					? refChild.textNode
					: undefined

		if (!refDomNode) {
			// ref is a comment — find next non-comment sibling for core DOM positioning
			const siblings = this._wchildren
			const refIdx = siblings.indexOf(refChild)
			let nextCoreSibling: DOMElement | TextNode | undefined
			for (let i = refIdx + 1; i < siblings.length; i++) {
				const sib = siblings[i]
				if (sib instanceof WolfieElement) {
					nextCoreSibling = sib.domElement
					break
				}
				if (sib instanceof WolfieText) {
					nextCoreSibling = sib.textNode
					break
				}
			}

			if (nextCoreSibling) {
				if (newChild instanceof WolfieElement) {
					insertBeforeNode(
						this.domElement,
						newChild.domElement,
						nextCoreSibling,
						lt
					)
				} else if (newChild instanceof WolfieText) {
					insertBeforeNode(
						this.domElement,
						newChild.textNode,
						nextCoreSibling,
						lt
					)
				}
			} else {
				// No core sibling after comment — append
				if (newChild instanceof WolfieElement) {
					appendChildNode(this.domElement, newChild.domElement, lt)
				} else if (newChild instanceof WolfieText) {
					appendChildNode(this.domElement, newChild.textNode, lt)
				}
			}
		} else {
			if (newChild instanceof WolfieElement) {
				insertBeforeNode(this.domElement, newChild.domElement, refDomNode, lt)
			} else if (newChild instanceof WolfieText) {
				insertBeforeNode(this.domElement, newChild.textNode, refDomNode, lt)
			}
		}
		scheduleRender()
	}

	protected override _coreDomRemove(child: WolfieNode): void {
		const lt = getLayoutTree()
		if (child instanceof WolfieElement) {
			removeChildNode(this.domElement, child.domElement, lt)
		} else if (child instanceof WolfieText) {
			removeChildNode(this.domElement, child.textNode, lt)
		}
		// WolfieComment: no core DOM node to remove
		scheduleRender()
	}

	protected override _cloneImpl(deep: boolean): WolfieElement {
		const cloned = new WolfieElement(this.nodeName)
		// Copy attributes
		for (const [key, val] of Object.entries(this.domElement.attributes)) {
			setAttribute(cloned.domElement, key, val)
		}
		// Copy style
		setStyle(cloned.domElement, { ...this.domElement.style })
		if (
			cloned.domElement.layoutNodeId !== undefined &&
			cloned.domElement.layoutTree
		) {
			applyLayoutStyle(
				cloned.domElement.layoutTree,
				cloned.domElement.layoutNodeId,
				cloned.domElement.style
			)
		}
		if (deep) {
			for (const child of this._wchildren) {
				cloned.appendChild(child.cloneNode(true))
			}
		}
		return cloned
	}

	//#endregion Core DOM delegation
}

//#endregion WolfieElement

//#region WolfieText

/**
 * Wraps a core TextNode. Delegates text value changes to setTextNodeValue().
 * Assigned to globalThis.Text.
 */
export class WolfieText extends WolfieNode {
	readonly nodeType = 3
	readonly nodeName = '#text'
	readonly textNode: TextNode

	// Svelte V8 shape hint — written on Text.prototype
	declare __t: unknown

	constructor(text?: string) {
		super()
		this.textNode = createTextNode(text ?? '')
	}

	get data(): string {
		return this.textNode.nodeValue
	}

	set data(value: string) {
		const old = this.textNode.nodeValue
		setTextNodeValue(this.textNode, value, this.textNode.layoutTree)
		if (logger.enabled && value !== old) {
			logger.log({
				ts: performance.now(),
				cat: 'svelte',
				op: 'textData:set',
				old: old.slice(0, 40),
				new: value.slice(0, 40),
			})
		}
		scheduleRender()
	}

	get nodeValue(): string {
		return this.textNode.nodeValue
	}

	set nodeValue(value: string) {
		this.data = value
	}

	override get textContent(): string {
		return this.data
	}

	override set textContent(value: string) {
		this.data = value
	}

	get wholeText(): string {
		return this.data
	}

	protected override _cloneImpl(_deep: boolean): WolfieText {
		return new WolfieText(this.data)
	}
}

//#endregion WolfieText

//#region WolfieComment

/**
 * Dummy node for Svelte's anchor comments ({#if}, {#each}, etc.).
 * No core DOM node — purely tracked in the wrapper tree for sibling navigation.
 * Assigned to globalThis.Comment.
 */
export class WolfieComment extends WolfieNode {
	readonly nodeType = 8
	readonly nodeName = '#comment'
	data: string

	constructor(text?: string) {
		super()
		this.data = text ?? ''
	}

	get nodeValue(): string {
		return this.data
	}

	set nodeValue(value: string) {
		this.data = value
	}

	override get textContent(): string {
		return this.data
	}

	override set textContent(value: string) {
		this.data = value
	}

	protected override _cloneImpl(_deep: boolean): WolfieComment {
		return new WolfieComment(this.data)
	}
}

//#endregion WolfieComment

//#region WolfieDocumentFragment

/**
 * Fragment node. When appended to a parent, its children move to the parent
 * (standard DOM fragment semantics). Used by Svelte for {#if}/{#each} blocks.
 * Assigned to globalThis.DocumentFragment.
 */
export class WolfieDocumentFragment extends WolfieNode {
	readonly nodeType = 11
	readonly nodeName = '#document-fragment'

	protected override _cloneImpl(deep: boolean): WolfieDocumentFragment {
		const frag = new WolfieDocumentFragment()
		if (deep) {
			for (const child of this._wchildren) {
				frag.appendChild(child.cloneNode(true))
			}
		}
		return frag
	}
}

//#endregion WolfieDocumentFragment
