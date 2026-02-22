import { createSignal, createMemo, createEffect, on } from 'solid-js'
import { DEFAULT_DOMAINS } from '@wolfie/shared'

//#region Types
export type UseEmailInputStateProps = {
  defaultValue?: string
  domains?: string[]
  onChange?: (value: string) => void
  onSubmit?: (value: string) => void
}

export type EmailInputState = {
  previousValue: () => string
  value: () => string
  cursorOffset: () => number
  suggestion: () => string | undefined
  moveCursorLeft: () => void
  moveCursorRight: () => void
  insert: (text: string) => void
  delete: () => void
  submit: () => void
}
//#endregion Types

//#region Composable
export const useEmailInputState = ({
  defaultValue = '',
  domains = DEFAULT_DOMAINS,
  onChange,
  onSubmit,
}: UseEmailInputStateProps = {}): EmailInputState => {
  const [previousValue, setPreviousValue] = createSignal(defaultValue)
  const [value, setValue] = createSignal(defaultValue)
  const [cursorOffset, setCursorOffset] = createSignal(defaultValue.length)

  const suggestion = createMemo(() => {
    if (value().length === 0 || !value().includes('@')) return undefined
    const atIndex = value().indexOf('@')
    const enteredDomain = value().slice(atIndex + 1)
    return domains?.find((d) => d.startsWith(enteredDomain))?.replace(enteredDomain, '')
  })

  const moveCursorLeft = () => {
    setCursorOffset((o) => Math.max(0, o - 1))
  }

  const moveCursorRight = () => {
    setCursorOffset((o) => Math.min(value().length, o + 1))
  }

  const insert = (text: string) => {
    // Prevent multiple @ symbols
    if (value().includes('@') && text.includes('@')) return

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
    if (suggestion()) {
      insert(suggestion()!)
      onSubmit?.(value())
      return
    }
    onSubmit?.(value())
  }

  // WHY: defer:true skips initial run, matching Vue watch (change-only, not immediate)
  createEffect(on(value, (newVal) => { onChange?.(newVal) }, { defer: true }))

  return {
    previousValue,
    value,
    cursorOffset,
    suggestion,
    moveCursorLeft,
    moveCursorRight,
    insert,
    delete: deleteCharacter,
    submit,
  }
}
//#endregion Composable
