export type {
	DOMElement,
	DOMNode,
	DOMNodeAttribute,
	TextNode,
	TextName,
	NodeNames,
	ElementNames,
} from './dom'
export {
	createNode,
	appendChildNode,
	insertBeforeNode,
	removeChildNode,
	setAttribute,
	setStyle,
	createTextNode,
	setTextNodeValue,
} from './dom'
export { default as Output } from './output'
export { default as renderer } from './renderer'
export type { Styles } from './styles'
export { default as applyStyles } from './styles'
export { default as parseKeypress, nonAlphanumericKeys } from './parse-keypress'
export { default as measureElement } from './measure-element'
export { default as measureText } from './measure-text'
export { default as wrapText } from './wrap-text'
export { default as squashTextNodes } from './squash-text-nodes'
export { default as renderBorder } from './render-border'
export { default as renderBackground } from './render-background'
export { default as getMaxWidth } from './get-max-width'
export { default as colorize } from './colorize'
export { type OutputTransformer } from './render-node-to-output'
export { default as renderNodeToOutput } from './render-node-to-output'
export { default as logUpdate } from './log-update'
export type { LogUpdate } from './log-update'

// Phase 2: Taffy/Yoga layout helpers
export {
	getComputedLayout,
	isDisplayNone,
	type ComputedLayout,
} from './get-computed-layout'
