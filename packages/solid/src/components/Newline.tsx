//#region Types
export interface NewlineProps {
	count?: number
}
//#endregion Types

export function Newline(props: NewlineProps) {
	const count = () => props.count ?? 1
	return <wolfie-text>{'\n'.repeat(count())}</wolfie-text>
}

export type { NewlineProps as Props, NewlineProps as IProps }
