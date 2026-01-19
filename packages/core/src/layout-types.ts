// Phase 2: Layout types for Taffy migration
// These types match the napi-rs generated bindings from rust/

/**
 * Computed layout dimensions and positions from Taffy.
 */
export interface ComputedLayout {
	x: number
	y: number
	width: number
	height: number
	paddingTop: number
	paddingRight: number
	paddingBottom: number
	paddingLeft: number
	borderTop: number
	borderRight: number
	borderBottom: number
	borderLeft: number
}

/**
 * Dimension value with unit for Taffy.
 */
export interface Dimension {
	value: number
	unit: string // "px" | "%" | "auto"
}

/**
 * Edge values for margin, padding, border.
 */
export interface Edges {
	top?: number
	right?: number
	bottom?: number
	left?: number
}

/**
 * Style input for Taffy layout nodes.
 */
export interface LayoutStyle {
	position?: string // "absolute" | "relative"
	display?: string // "flex" | "none" | "grid"
	overflow?: string // "visible" | "hidden" | "scroll"
	width?: Dimension
	height?: Dimension
	minWidth?: Dimension
	minHeight?: Dimension
	maxWidth?: Dimension
	maxHeight?: Dimension
	flexDirection?: string // "row" | "column" | "row-reverse" | "column-reverse"
	flexWrap?: string // "nowrap" | "wrap" | "wrap-reverse"
	flexGrow?: number
	flexShrink?: number
	flexBasis?: Dimension
	alignItems?: string // "flex-start" | "flex-end" | "center" | "baseline" | "stretch"
	alignSelf?: string
	alignContent?: string
	justifyContent?: string // "flex-start" | "flex-end" | "center" | "space-between" | "space-around" | "space-evenly"
	margin?: Edges
	padding?: Edges
	border?: Edges
	gap?: number
	columnGap?: number
	rowGap?: number
}

/**
 * LayoutTree interface for Taffy layout engine.
 * Implemented by napi-rs bindings in Phase 1.
 */
export interface LayoutTree {
	createNode(style: LayoutStyle): number
	insertChild(parent: number, child: number, index: number): void
	removeChild(parent: number, child: number): void
	removeNode(node: number): void
	setStyle(node: number, style: LayoutStyle): void
	setTextDimensions(node: number, width: number, height: number): void
	markDirty(node: number): void
	setDisplayNone(node: number): void
	setDisplayFlex(node: number): void
	computeLayout(root: number, width: number, height?: number | null): void
	getLayout(node: number): ComputedLayout
	getChildCount(node: number): number
}
