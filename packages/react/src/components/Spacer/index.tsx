import { renderSpacer } from '@wolfie/shared'
import { wNodeToReact } from '../../wnode/wnode-to-react'

export function Spacer() {
	return wNodeToReact(renderSpacer())
}
