import { useState, useCallback } from 'react'
import { measureElement, type DOMElement } from '@wolfie/core'
import {
	renderProgressBar,
	defaultProgressBarTheme,
	type ProgressBarRenderTheme,
} from '@wolfie/shared'
import { useComponentTheme } from '../../theme/theme'
import { wNodeToReact } from '../../wnode/wnode-to-react'
import type { IProgressBarProps } from './types'

//#region ProgressBarComponent
export function ProgressBar({ value }: IProgressBarProps) {
	const [width, setWidth] = useState(0)

	// WHY: useCallback with [] dependency — stable ref callback avoids re-registering
	// on every render while still capturing setWidth from closure
	const ref = useCallback((el: DOMElement | null) => {
		if (el) {
			const dimensions = measureElement(el)
			setWidth((prev) => (prev !== dimensions.width ? dimensions.width : prev))
		}
	}, [])

	const theme =
		useComponentTheme<ProgressBarRenderTheme>('ProgressBar') ??
		defaultProgressBarTheme

	// WHY: wrapper wolfie-box owns the container style + DOM ref for measurement.
	// renderProgressBar returns bar content only (no container) so we don't double-nest.
	return (
		<wolfie-box ref={ref} style={{ flexGrow: 1, minWidth: 0 }}>
			{wNodeToReact(renderProgressBar({ value, width }, theme))}
		</wolfie-box>
	)
}
//#endregion ProgressBarComponent
