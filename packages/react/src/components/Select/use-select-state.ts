import { isDeepStrictEqual } from 'node:util'
import {
	useReducer,
	type Reducer,
	useCallback,
	useMemo,
	useState,
	useEffect,
} from 'react'
import type { Option } from '../types'
import OptionMap from '../../lib/option-map'

//#region Types
type State = {
	/**
	 * Map where key is option's value and value is option's index.
	 */
	optionMap: OptionMap

	/**
	 * Number of visible options.
	 */
	visibleOptionCount: number

	/**
	 * Value of the currently focused option.
	 */
	focusedValue: string | undefined

	/**
	 * Index of the first visible option.
	 */
	visibleFromIndex: number

	/**
	 * Index of the last visible option.
	 */
	visibleToIndex: number

	/**
	 * Value of the previously selected option.
	 */
	previousValue: string | undefined

	/**
	 * Value of the selected option.
	 */
	value: string | undefined
}

type Action =
	| FocusNextOptionAction
	| FocusPreviousOptionAction
	| SelectFocusedOptionAction
	| ResetAction
	| SyncValueAction

type FocusNextOptionAction = {
	type: 'focus-next-option'
}

type FocusPreviousOptionAction = {
	type: 'focus-previous-option'
}

type SelectFocusedOptionAction = {
	type: 'select-focused-option'
}

type ResetAction = {
	type: 'reset'
	state: State
}

type SyncValueAction = {
	type: 'sync-value'
	value: string
}

export type UseSelectStateProps = {
	/**
	 * Number of items to display.
	 *
	 * @default 5
	 */
	visibleOptionCount?: number

	/**
	 * Options.
	 */
	options: Option[]

	/**
	 * Controlled value. When provided, component reflects this value.
	 */
	value?: string

	/**
	 * Initially selected option's value (uncontrolled mode).
	 */
	defaultValue?: string

	/**
	 * Callback for selecting an option.
	 */
	onChange?: (value: string) => void
}

export type SelectState = Pick<
	State,
	'focusedValue' | 'visibleFromIndex' | 'visibleToIndex' | 'value'
> & {
	/**
	 * Visible options.
	 */
	visibleOptions: Array<Option & { index: number }>

	/**
	 * Focus next option and scroll the list down, if needed.
	 */
	focusNextOption: () => void

	/**
	 * Focus previous option and scroll the list up, if needed.
	 */
	focusPreviousOption: () => void

	/**
	 * Select currently focused option.
	 */
	selectFocusedOption: () => void
}
//#endregion Types

//#region Reducer
const reducer: Reducer<State, Action> = (state, action) => {
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

//#region State Factory
const createDefaultState = ({
	visibleOptionCount: customVisibleOptionCount,
	defaultValue,
	options,
}: Pick<
	UseSelectStateProps,
	'visibleOptionCount' | 'defaultValue' | 'options'
>): State => {
	const visibleOptionCount =
		typeof customVisibleOptionCount === 'number'
			? Math.min(customVisibleOptionCount, options.length)
			: options.length

	const optionMap = new OptionMap(options)

	return {
		optionMap,
		visibleOptionCount,
		focusedValue: optionMap.first?.value,
		visibleFromIndex: 0,
		visibleToIndex: visibleOptionCount,
		previousValue: defaultValue,
		value: defaultValue,
	}
}
//#endregion State Factory

//#region Hook
export const useSelectState = ({
	visibleOptionCount = 5,
	options,
	value: controlledValue,
	defaultValue,
	onChange,
}: UseSelectStateProps): SelectState => {
	// Use controlled value if provided, otherwise use defaultValue
	const initialValue = controlledValue ?? defaultValue
	const [state, dispatch] = useReducer(
		reducer,
		{ visibleOptionCount, defaultValue: initialValue, options },
		createDefaultState
	)

	const [lastOptions, setLastOptions] = useState(options)
	const [lastControlledValue, setLastControlledValue] =
		useState(controlledValue)

	if (options !== lastOptions && !isDeepStrictEqual(options, lastOptions)) {
		dispatch({
			type: 'reset',
			state: createDefaultState({
				visibleOptionCount,
				defaultValue: initialValue,
				options,
			}),
		})

		setLastOptions(options)
	}

	// Sync with controlled value
	if (
		controlledValue !== undefined &&
		controlledValue !== lastControlledValue
	) {
		dispatch({ type: 'sync-value', value: controlledValue })
		setLastControlledValue(controlledValue)
	}

	const focusNextOption = useCallback(() => {
		dispatch({
			type: 'focus-next-option',
		})
	}, [])

	const focusPreviousOption = useCallback(() => {
		dispatch({
			type: 'focus-previous-option',
		})
	}, [])

	const selectFocusedOption = useCallback(() => {
		dispatch({
			type: 'select-focused-option',
		})
	}, [])

	const visibleOptions = useMemo(() => {
		return options
			.map((option, index) => ({
				...option,
				index,
			}))
			.slice(state.visibleFromIndex, state.visibleToIndex)
	}, [options, state.visibleFromIndex, state.visibleToIndex])

	useEffect(() => {
		if (state.value && state.previousValue !== state.value) {
			onChange?.(state.value)
		}
	}, [state.previousValue, state.value, options, onChange])

	return {
		focusedValue: state.focusedValue,
		visibleFromIndex: state.visibleFromIndex,
		visibleToIndex: state.visibleToIndex,
		value: state.value,
		visibleOptions,
		focusNextOption,
		focusPreviousOption,
		selectFocusedOption,
	}
}
//#endregion Hook
