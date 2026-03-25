import { type JSX } from 'solid-js'
import { renderSpacer } from '@wolf-tui/shared'
import { wNodeToSolid } from '../wnode/wnode-to-solid'

export function Spacer(): JSX.Element {
	return (() => wNodeToSolid(renderSpacer())) as unknown as JSX.Element
}
