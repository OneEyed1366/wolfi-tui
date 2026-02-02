/**
 * CSS Module type declarations for tsc compilation.
 * The @wolfie/typescript-plugin provides enhanced IDE support
 * with specific class name completions.
 */

declare module '*.module.css' {
	import type { Styles } from '@wolfie/core'
	const styles: Record<string, Styles>
	export default styles
}

declare module '*.module.scss' {
	import type { Styles } from '@wolfie/core'
	const styles: Record<string, Styles>
	export default styles
}

declare module '*.module.less' {
	import type { Styles } from '@wolfie/core'
	const styles: Record<string, Styles>
	export default styles
}

declare module '*.module.styl' {
	import type { Styles } from '@wolfie/core'
	const styles: Record<string, Styles>
	export default styles
}
