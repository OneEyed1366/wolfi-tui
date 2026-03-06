import { renderNewline } from '@wolfie/shared'
import { wNodeToReact } from '../../wnode/wnode-to-react'
import type { IProps } from './types'

export function Newline({ count = 1 }: IProps) {
	return wNodeToReact(renderNewline({ count }))
}

export type { IProps as Props } from './types'
export type { IProps } from './types'
