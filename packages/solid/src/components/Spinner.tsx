import { type JSX, createSignal, onCleanup } from 'solid-js'
import { Box } from './Box'
import { Text } from './Text'

//#region Types
export interface ISpinnerProps {
	label?: string
}
//#endregion Types

// WHY: inlined to avoid adding cli-spinners dep; these are the standard dots3 frames
const FRAMES = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏']

export function Spinner(props: ISpinnerProps): JSX.Element {
	const [frame, setFrame] = createSignal(0)

	// WHY: clearInterval on cleanup prevents timer from firing after unmount,
	// which would trigger renders on a detached component
	const timer = setInterval(() => setFrame((i) => (i + 1) % FRAMES.length), 80)
	onCleanup(() => clearInterval(timer))

	return (
		<Box style={{ gap: 1 }}>
			<Text style={{ color: 'blue' }}>{FRAMES[frame()]}</Text>
			{props.label && <Text>{props.label}</Text>}
		</Box>
	)
}
