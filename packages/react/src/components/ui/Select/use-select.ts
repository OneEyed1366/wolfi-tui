import useInput from '../../../hooks/use-input.js'
import type { SelectState } from './use-select-state.js'

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

//#region Hook
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
//#endregion Hook
