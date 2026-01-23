import React from 'react'
import type { IProps } from './types'

/**
Adds one or more newline (`\n`) characters. Must be used within `<Text>` components.
*/
export function Newline({ count = 1 }: IProps) {
	return <wolfie-text>{'\n'.repeat(count)}</wolfie-text>
}

export type { IProps as Props } from './types'
export type { IProps } from './types'
