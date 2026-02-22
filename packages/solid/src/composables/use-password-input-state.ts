import { createSignal, createEffect, on } from 'solid-js'

//#region Types
export type UsePasswordInputStateProps = {
  onChange?: (value: string) => void
  onSubmit?: (value: string) => void
}

export type PasswordInputState = {
  previousValue: () => string
  value: () => string
  cursorOffset: () => number
  moveCursorLeft: () => void
  moveCursorRight: () => void
  insert: (text: string) => void
  delete: () => void
  submit: () => void
}
//#endregion Types

//#region Composable
export const usePasswordInputState = ({
  onChange,
  onSubmit,
}: UsePasswordInputStateProps = {}): PasswordInputState => {
  const [previousValue, setPreviousValue] = createSignal('')
  const [value, setValue] = createSignal('')
  const [cursorOffset, setCursorOffset] = createSignal(0)

  const moveCursorLeft = () => {
    setCursorOffset((o) => Math.max(0, o - 1))
  }

  const moveCursorRight = () => {
    setCursorOffset((o) => Math.min(value().length, o + 1))
  }

  const insert = (text: string) => {
    setPreviousValue(value())
    setValue((v) => v.slice(0, cursorOffset()) + text + v.slice(cursorOffset()))
    setCursorOffset((o) => o + text.length)
  }

  const deleteCharacter = () => {
    const newCursorOffset = Math.max(0, cursorOffset() - 1)
    setPreviousValue(value())
    setValue((v) => v.slice(0, newCursorOffset) + v.slice(newCursorOffset + 1))
    setCursorOffset(newCursorOffset)
  }

  const submit = () => {
    onSubmit?.(value())
  }

  // WHY: defer:true skips initial run, matching Vue watch (change-only, not immediate)
  createEffect(on(value, (newVal) => { onChange?.(newVal) }, { defer: true }))

  return {
    previousValue,
    value,
    cursorOffset,
    moveCursorLeft,
    moveCursorRight,
    insert,
    delete: deleteCharacter,
    submit,
  }
}
//#endregion Composable
