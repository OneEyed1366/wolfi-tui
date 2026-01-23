import { type ReactNode, type Key, type LegacyRef } from 'react'
import { type Except } from 'type-fest'
import { type DOMElement, type Styles } from '@wolfie/core'

/// <reference types="vite/client" />

declare namespace Wolfie {
	type Box = {
		internal_static?: boolean
		children?: ReactNode
		key?: Key
		ref?: LegacyRef<DOMElement>
		style?: Except<Styles, 'textWrap'>
		internal_accessibility?: DOMElement['internal_accessibility']
	}

	type Text = {
		children?: ReactNode
		key?: Key
		style?: Styles
		internal_transform?: (children: string, index: number) => string
		internal_accessibility?: DOMElement['internal_accessibility']
	}
}

declare module 'react' {
	namespace JSX {
		interface IntrinsicElements {
			'wolwie_react-box': Wolfie.Box
			'wolwie_react-text': Wolfie.Text
		}
	}
}
