import { useInput } from './use-input'
import type { SelectState } from './use-select-state'

//#region Types
export type UseSelectProps = {
	/**
	 * When disabled, user input is ignored.
	 *
	 * @default false
	 */
	isDisabled?: boolean

	/**
	 * Select state.
	 */
	state: SelectState
}
//#endregion Types

//#region Composable
export const useSelect = ({ isDisabled = false, state }: UseSelectProps) => {
	useInput(
		(_input, key) => {
			if (key.downArrow) {
				state.focusNextOption()
			}

			if (key.upArrow) {
				state.focusPreviousOption()
			}

			if (key.return) {
				state.selectFocusedOption()
			}
		},
		{ isActive: !isDisabled }
	)
}
//#endregion Composable
