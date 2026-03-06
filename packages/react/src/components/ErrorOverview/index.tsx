import { parseErrorToViewState, renderErrorOverview } from '@wolfie/shared'
import { wNodeToReact } from '../../wnode/wnode-to-react'
import type { IProps } from './types'

//#region ErrorOverviewComponent
export function ErrorOverview({ error }: IProps) {
	const state = parseErrorToViewState(error)
	return wNodeToReact(renderErrorOverview(state))
}
//#endregion ErrorOverviewComponent

export type { IProps as Props } from './types'
export type { IProps } from './types'
