/// <reference types="@wolfie/vue/global" />

declare module '*.vue' {
	import type { DefineComponent } from 'vue'
	const component: DefineComponent<object, object, any>
	export default component
}

/**
 * CSS Module type declarations for tsc compatibility.
 * The @wolfie/typescript-plugin provides enhanced IntelliSense in editors.
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
