import { defineComponent, h, provide, ref } from 'vue'
import type { Styles } from '@wolfie/core'
import type { ClassNameValue } from '@wolfie/shared'
import { describeTextContract, type TextRenderResult } from '@wolfie/spec'
import { Text } from '../../src/components'
import { BackgroundSymbol } from '../../src/context/symbols'
import { renderToString } from '../helpers/render-to-string'

function vueTextRenderer(
	props: {
		children: string
		className?: ClassNameValue
		style?: Partial<Styles>
	},
	options?: { parentBg?: string }
): TextRenderResult {
	const App = defineComponent({
		setup() {
			if (options?.parentBg) provide(BackgroundSymbol, ref(options.parentBg))
			return () =>
				h(
					Text,
					{ className: props.className, style: props.style as Styles },
					() => props.children
				)
		},
	})
	return { output: renderToString(App) }
}

describeTextContract(vueTextRenderer)
