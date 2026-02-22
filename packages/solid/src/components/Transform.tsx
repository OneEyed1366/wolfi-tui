import { useContext, type JSX } from 'solid-js'
import { AccessibilityCtx } from '../context/symbols'

//#region Types
export interface TransformProps {
	accessibilityLabel?: string
	transform: (children: string, index: number) => string
	children?: JSX.Element
}
//#endregion Types

export function Transform(props: TransformProps) {
	const accessibility = useContext(AccessibilityCtx)

	return (() => {
		if (props.children === undefined || props.children === null) {
			return null
		}

		const isScreenReaderEnabled = accessibility?.isScreenReaderEnabled
		const content =
			isScreenReaderEnabled && props.accessibilityLabel
				? props.accessibilityLabel
				: props.children

		return (
			<wolfie-text internal_transform={props.transform}>{content}</wolfie-text>
		)
	})()
}

export type { TransformProps as Props, TransformProps as IProps }
