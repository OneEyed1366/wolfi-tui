import { OptionMap, type Option } from '../index'

//#region Types
export type SelectState = {
	optionMap: OptionMap
	visibleOptionCount: number
	focusedValue: string | undefined
	visibleFromIndex: number
	visibleToIndex: number
	previousValue: string | undefined
	value: string | undefined
}

export type SelectAction =
	| { type: 'focus-next-option' }
	| { type: 'focus-previous-option' }
	| { type: 'select-focused-option' }
	| { type: 'reset'; state: SelectState }
	| { type: 'sync-value'; value: string }
//#endregion Types

//#region Reducer
export function selectReducer(
	state: SelectState,
	action: SelectAction
): SelectState {
	switch (action.type) {
		case 'focus-next-option': {
			if (!state.focusedValue) {
				return state
			}

			const item = state.optionMap.get(state.focusedValue)

			if (!item) {
				return state
			}

			const next = item.next

			if (!next) {
				return state
			}

			const needsToScroll = next.index >= state.visibleToIndex

			if (!needsToScroll) {
				return {
					...state,
					focusedValue: next.value,
				}
			}

			const nextVisibleToIndex = Math.min(
				state.optionMap.size,
				state.visibleToIndex + 1
			)

			const nextVisibleFromIndex = nextVisibleToIndex - state.visibleOptionCount

			return {
				...state,
				focusedValue: next.value,
				visibleFromIndex: nextVisibleFromIndex,
				visibleToIndex: nextVisibleToIndex,
			}
		}

		case 'focus-previous-option': {
			if (!state.focusedValue) {
				return state
			}

			const item = state.optionMap.get(state.focusedValue)

			if (!item) {
				return state
			}

			const previous = item.previous

			if (!previous) {
				return state
			}

			const needsToScroll = previous.index <= state.visibleFromIndex

			if (!needsToScroll) {
				return {
					...state,
					focusedValue: previous.value,
				}
			}

			const nextVisibleFromIndex = Math.max(0, state.visibleFromIndex - 1)

			const nextVisibleToIndex = nextVisibleFromIndex + state.visibleOptionCount

			return {
				...state,
				focusedValue: previous.value,
				visibleFromIndex: nextVisibleFromIndex,
				visibleToIndex: nextVisibleToIndex,
			}
		}

		case 'select-focused-option': {
			return {
				...state,
				previousValue: state.value,
				value: state.focusedValue,
			}
		}

		case 'reset': {
			return action.state
		}

		case 'sync-value': {
			return {
				...state,
				value: action.value,
				focusedValue: action.value,
			}
		}

		default:
			return state
	}
}
//#endregion Reducer

//#region Factory
export function createDefaultSelectState(options: {
	visibleOptionCount?: number
	defaultValue?: string
	options: Option[]
}): SelectState {
	const visibleOptionCount =
		typeof options.visibleOptionCount === 'number'
			? Math.min(options.visibleOptionCount, options.options.length)
			: options.options.length

	const optionMap = new OptionMap(options.options)

	return {
		optionMap,
		visibleOptionCount,
		focusedValue: optionMap.first?.value,
		visibleFromIndex: 0,
		visibleToIndex: visibleOptionCount,
		previousValue: options.defaultValue,
		value: options.defaultValue,
	}
}
//#endregion Factory
