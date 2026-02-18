import { defineComponent, inject, provide, ref, unref, h } from 'vue'
import type { Styles } from '@wolfie/core'
import { computeBoxStyle, type ClassNameValue } from '@wolfie/shared'
import { describeBoxContract, type BoxRenderResult } from '@wolfie/spec'
import { Box } from '../../src/components/Box'
import { BackgroundSymbol } from '../../src/context/symbols'
import { renderToString } from '../helpers/render-to-string'

function vueBoxRenderer(
	props: {
		className?: ClassNameValue
		style?: Partial<Styles>
		children?: string
	},
	options?: { parentBg?: string }
): BoxRenderResult {
	let capturedBg: string | undefined = undefined

	// Child component that reads the background provided by Box
	const BgCapture = defineComponent({
		setup() {
			const bgRef = inject(BackgroundSymbol, undefined)
			capturedBg = bgRef ? (unref(bgRef) as string | undefined) : undefined
			return () => null
		},
	})

	// Wrapper that optionally provides a parent background (simulates parent Box)
	const Wrapper = defineComponent({
		setup(_, { slots }) {
			if (options?.parentBg) {
				provide(BackgroundSymbol, ref(options.parentBg))
			}
			return () => slots.default?.()
		},
	})

	// Root component combining wrapper + box + capture child
	const App = defineComponent({
		render() {
			return h(Wrapper, () =>
				h(
					Box,
					{ className: props.className, style: props.style as Styles },
					() => [h(BgCapture), props.children ?? 'test']
				)
			)
		},
	})

	const output = renderToString(App)

	// appliedStyle derived from computeBoxStyle — Box delegates to it internally
	const appliedStyle = computeBoxStyle({
		className: props.className,
		style: props.style,
	})

	return { appliedStyle, providedBg: capturedBg, output }
}

describeBoxContract(vueBoxRenderer)
