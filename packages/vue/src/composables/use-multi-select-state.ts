import { isDeepStrictEqual } from 'node:util'
import {
	ref,
	computed,
	watch,
	toValue,
	type Ref,
	type ComputedRef,
	type MaybeRef,
} from 'vue'
import { OptionMap, type Option } from '@wolfie/shared'

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
	 * Values of previously selected options.
	 */
	previousValue: string[]

	/**
	 * Indexes of selected options.
	 */
	value: string[]
}

export type UseMultiSelectStateProps = {
	/**
	 * Number of visible options.
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
	value?: MaybeRef<string[] | undefined>

	/**
	 * Initially selected option values (uncontrolled mode).
	 */
	defaultValue?: string[]

	/**
	 * Callback for selecting options.
	 */
	onChange?: (value: string[]) => void

	/**
	 * Callback when user presses enter.
	 * First argument is an array of selected option values.
	 */
	onSubmit?: (value: string[]) => void
}

export type MultiSelectState = {
	/**
	 * Value of the currently focused option.
	 */
	focusedValue: Ref<string | undefined>

	/**
	 * Index of the first visible option.
	 */
	visibleFromIndex: Ref<number>

	/**
	 * Index of the last visible option.
	 */
	visibleToIndex: Ref<number>

	/**
	 * Values of selected options.
	 */
	value: ComputedRef<string[]>

	/**
	 * Visible options.
	 */
	visibleOptions: ComputedRef<Array<Option & { index: number }>>

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
	toggleFocusedOption: () => void

	/**
	 * Trigger `onSubmit` callback.
	 */
	submit: () => void
}
//#endregion Types

//#region State Factory
const createDefaultState = ({
	visibleOptionCount: customVisibleOptionCount,
	defaultValue,
	options,
}: Pick<
	UseMultiSelectStateProps,
	'visibleOptionCount' | 'defaultValue' | 'options'
>): State => {
	const visibleOptionCount =
		typeof customVisibleOptionCount === 'number'
			? Math.min(customVisibleOptionCount, options.length)
			: options.length

	const optionMap = new OptionMap(options)
	const value = defaultValue ?? []

	return {
		optionMap,
		visibleOptionCount,
		focusedValue: optionMap.first?.value,
		visibleFromIndex: 0,
		visibleToIndex: visibleOptionCount,
		previousValue: value,
		value,
	}
}
//#endregion State Factory

//#region Composable
export const useMultiSelectState = ({
	visibleOptionCount = 5,
	options,
	value: controlledValue,
	defaultValue,
	onChange,
	onSubmit,
}: UseMultiSelectStateProps): MultiSelectState => {
	// Use controlled value if provided, otherwise use defaultValue
	const initialValue = toValue(controlledValue) ?? defaultValue
	const initialState = createDefaultState({
		visibleOptionCount,
		defaultValue: initialValue,
		options,
	})

	const optionMap = ref(initialState.optionMap)
	const visibleCount = ref(initialState.visibleOptionCount)
	const focusedValue = ref(initialState.focusedValue)
	const visibleFromIndex = ref(initialState.visibleFromIndex)
	const visibleToIndex = ref(initialState.visibleToIndex)
	const previousValue = ref(initialState.previousValue)
	const internalValue = ref(initialState.value)

	// Controlled mode: derive value from prop; uncontrolled: use internal state
	const value = computed(() => toValue(controlledValue) ?? internalValue.value)

	const lastOptions = ref(options)

	// Watch for options changes
	watch(
		() => options,
		(newOptions) => {
			if (
				newOptions !== lastOptions.value &&
				!isDeepStrictEqual(newOptions, lastOptions.value)
			) {
				const newState = createDefaultState({
					visibleOptionCount,
					defaultValue,
					options: newOptions,
				})

				optionMap.value = newState.optionMap
				visibleCount.value = newState.visibleOptionCount
				focusedValue.value = newState.focusedValue
				visibleFromIndex.value = newState.visibleFromIndex
				visibleToIndex.value = newState.visibleToIndex
				previousValue.value = newState.previousValue
				internalValue.value = newState.value

				lastOptions.value = newOptions
			}
		},
		{ deep: true }
	)

	const focusNextOption = () => {
		if (!focusedValue.value) {
			return
		}

		const item = optionMap.value.get(focusedValue.value)
		if (!item) {
			return
		}

		const next = item.next
		if (!next) {
			return
		}

		const needsToScroll = next.index >= visibleToIndex.value

		if (!needsToScroll) {
			focusedValue.value = next.value
			return
		}

		const nextVisibleToIndex = Math.min(
			optionMap.value.size,
			visibleToIndex.value + 1
		)
		const nextVisibleFromIndex = nextVisibleToIndex - visibleCount.value

		focusedValue.value = next.value
		visibleFromIndex.value = nextVisibleFromIndex
		visibleToIndex.value = nextVisibleToIndex
	}

	const focusPreviousOption = () => {
		if (!focusedValue.value) {
			return
		}

		const item = optionMap.value.get(focusedValue.value)
		if (!item) {
			return
		}

		const previous = item.previous
		if (!previous) {
			return
		}

		const needsToScroll = previous.index <= visibleFromIndex.value

		if (!needsToScroll) {
			focusedValue.value = previous.value
			return
		}

		const nextVisibleFromIndex = Math.max(0, visibleFromIndex.value - 1)
		const nextVisibleToIndex = nextVisibleFromIndex + visibleCount.value

		focusedValue.value = previous.value
		visibleFromIndex.value = nextVisibleFromIndex
		visibleToIndex.value = nextVisibleToIndex
	}

	const toggleFocusedOption = () => {
		if (!focusedValue.value) {
			return
		}

		if (internalValue.value.includes(focusedValue.value)) {
			const newVal = new Set(internalValue.value)
			newVal.delete(focusedValue.value)
			previousValue.value = internalValue.value
			internalValue.value = [...newVal]
		} else {
			previousValue.value = internalValue.value
			internalValue.value = [...internalValue.value, focusedValue.value]
		}
	}

	const submit = () => {
		onSubmit?.(value.value)
	}

	const visibleOptions = computed(() => {
		return options
			.map((option, index) => ({
				...option,
				index,
			}))
			.slice(visibleFromIndex.value, visibleToIndex.value)
	})

	watch(
		internalValue,
		(newValue, oldValue) => {
			if (!isDeepStrictEqual(oldValue, newValue)) {
				onChange?.(newValue)
			}
		},
		{ deep: true }
	)

	return {
		focusedValue,
		visibleFromIndex,
		visibleToIndex,
		value,
		visibleOptions,
		focusNextOption,
		focusPreviousOption,
		toggleFocusedOption,
		submit,
	}
}
//#endregion Composable
