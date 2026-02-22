import 'solid-js'

declare module 'solid-js' {
	namespace JSX {
		interface IntrinsicElements {
			'wolfie-box': any
			'wolfie-text': any
			'wolfie-root': any
			'wolfie-virtual-text': any
		}
	}
}
