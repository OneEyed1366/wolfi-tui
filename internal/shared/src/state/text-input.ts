//#region State Types
export type TextInputState = {
	previousValue: string
	value: string
	cursorOffset: number
}

export type TextInputAction =
	| { type: 'move-cursor-left' }
	| { type: 'move-cursor-right' }
	| { type: 'insert'; text: string }
	| { type: 'delete' }
//#endregion State Types

//#region Reducer
export function textInputReducer(
	state: TextInputState,
	action: TextInputAction
): TextInputState {
	switch (action.type) {
		case 'move-cursor-left': {
			return {
				...state,
				cursorOffset: Math.max(0, state.cursorOffset - 1),
			}
		}

		case 'move-cursor-right': {
			return {
				...state,
				cursorOffset: Math.min(state.value.length, state.cursorOffset + 1),
			}
		}

		case 'insert': {
			return {
				...state,
				previousValue: state.value,
				value:
					state.value.slice(0, state.cursorOffset) +
					action.text +
					state.value.slice(state.cursorOffset),
				cursorOffset: state.cursorOffset + action.text.length,
			}
		}

		case 'delete': {
			const newCursorOffset = Math.max(0, state.cursorOffset - 1)

			return {
				...state,
				previousValue: state.value,
				value:
					state.value.slice(0, newCursorOffset) +
					state.value.slice(newCursorOffset + 1),
				cursorOffset: newCursorOffset,
			}
		}
	}
}
//#endregion Reducer

//#region Factory
export function createInitialTextInputState(defaultValue = ''): TextInputState {
	return {
		previousValue: defaultValue,
		value: defaultValue,
		cursorOffset: defaultValue.length,
	}
}
//#endregion Factory

//#region Suggestion
export function findSuggestion(
	value: string,
	suggestions?: string[]
): string | undefined {
	if (value.length === 0) {
		return undefined
	}

	return suggestions
		?.find((suggestion) => suggestion.startsWith(value))
		?.replace(value, '')
}
//#endregion Suggestion
