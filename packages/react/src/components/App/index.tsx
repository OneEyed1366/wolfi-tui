import { EventEmitter } from 'node:events'
import process from 'node:process'
import React, { PureComponent } from 'react'
import cliCursor from 'cli-cursor'
import { AppContext } from '../../context/AppContext'
import { StdinContext } from '../../context/StdinContext'
import { StdoutContext } from '../../context/StdoutContext'
import { StderrContext } from '../../context/StderrContext'
import { FocusContext } from '../../context/FocusContext'
import { ErrorOverview } from '../ErrorOverview'
import type { IProps, IState } from './types'

const tab = '\t'
const shiftTab = '\u001B[Z'
const escape = '\u001B'

export class App extends PureComponent<IProps, IState> {
	static displayName = 'InternalApp'

	static getDerivedStateFromError(error: Error) {
		return { error }
	}

	override state = {
		isFocusEnabled: true,
		activeFocusId: undefined,
		focusables: [],
		error: undefined,
	}

	rawModeEnabledCount = 0
	internal_eventEmitter = new EventEmitter()

	isRawModeSupported(): boolean {
		return this.props.stdin.isTTY
	}

	override render() {
		return (
			<AppContext.Provider
				value={{
					exit: this.handleExit,
				}}
			>
				<StdinContext.Provider
					value={{
						stdin: this.props.stdin,
						setRawMode: this.handleSetRawMode,
						isRawModeSupported: this.isRawModeSupported(),
						internal_exitOnCtrlC: this.props.exitOnCtrlC,
						internal_eventEmitter: this.internal_eventEmitter,
					}}
				>
					<StdoutContext.Provider
						value={{
							stdout: this.props.stdout,
							write: this.props.writeToStdout,
						}}
					>
						<StderrContext.Provider
							value={{
								stderr: this.props.stderr,
								write: this.props.writeToStderr,
							}}
						>
							<FocusContext.Provider
								value={{
									activeId: this.state.activeFocusId,
									add: this.addFocusable,
									remove: this.removeFocusable,
									activate: this.activateFocusable,
									deactivate: this.deactivateFocusable,
									enableFocus: this.enableFocus,
									disableFocus: this.disableFocus,
									focusNext: this.focusNext,
									focusPrevious: this.focusPrevious,
									focus: this.focus,
								}}
							>
								{this.state.error ? (
									<ErrorOverview error={this.state.error as Error} />
								) : (
									this.props.children
								)}
							</FocusContext.Provider>
						</StderrContext.Provider>
					</StdoutContext.Provider>
				</StdinContext.Provider>
			</AppContext.Provider>
		)
	}

	override componentDidMount() {
		cliCursor.hide(this.props.stdout)
	}

	override componentWillUnmount() {
		cliCursor.show(this.props.stdout)

		if (this.isRawModeSupported()) {
			this.handleSetRawMode(false)
		}
	}

	override componentDidCatch(error: Error) {
		this.handleExit(error)
	}

	handleSetRawMode = (isEnabled: boolean): void => {
		const { stdin } = this.props

		if (!this.isRawModeSupported()) {
			if (stdin === process.stdin) {
				throw new Error(
					'Raw mode is not supported on the current process.stdin, which Wolfie uses as input stream by default.\nRead about how to prevent this error on https://github.com/vadimdemedes/ink/#israwmodesupported'
				)
			} else {
				throw new Error(
					'Raw mode is not supported on the stdin provided to Wolfie.\nRead about how to prevent this error on https://github.com/vadimdemedes/ink/#israwmodesupported'
				)
			}
		}

		stdin.setEncoding('utf8')

		if (isEnabled) {
			if (this.rawModeEnabledCount === 0) {
				stdin.ref()
				stdin.setRawMode(true)
				stdin.addListener('readable', this.handleReadable)
			}

			this.rawModeEnabledCount++
			return
		}

		if (--this.rawModeEnabledCount === 0) {
			stdin.setRawMode(false)
			stdin.removeListener('readable', this.handleReadable)
			stdin.unref()
		}
	}

	handleReadable = (): void => {
		let chunk
		while ((chunk = this.props.stdin.read() as string | null) !== null) {
			this.handleInput(chunk)
			this.internal_eventEmitter.emit('input', chunk)
		}
	}

	handleInput = (input: string): void => {
		if (input === '\x03' && this.props.exitOnCtrlC) {
			this.handleExit()
		}

		if (input === escape && this.state.activeFocusId) {
			this.setState({
				activeFocusId: undefined,
			})
		}

		if (this.state.isFocusEnabled && this.state.focusables.length > 0) {
			if (input === tab) {
				this.focusNext()
			}

			if (input === shiftTab) {
				this.focusPrevious()
			}
		}
	}

	handleExit = (error?: Error): void => {
		if (this.isRawModeSupported()) {
			this.handleSetRawMode(false)
		}

		this.props.onExit(error)
	}

	enableFocus = (): void => {
		this.setState({
			isFocusEnabled: true,
		})
	}

	disableFocus = (): void => {
		this.setState({
			isFocusEnabled: false,
		})
	}

	focus = (id: string): void => {
		this.setState((previousState) => {
			const hasFocusableId = previousState.focusables.some(
				(focusable) => focusable?.id === id
			)

			if (!hasFocusableId) {
				return null
			}

			return { activeFocusId: id }
		})
	}

	focusNext = (): void => {
		this.setState((previousState) => {
			const firstFocusableId = previousState.focusables.find(
				(focusable) => focusable.isActive
			)?.id
			const nextFocusableId = this.findNextFocusable(previousState)

			return {
				activeFocusId: nextFocusableId ?? firstFocusableId,
			}
		})
	}

	focusPrevious = (): void => {
		this.setState((previousState) => {
			const lastFocusableId = previousState.focusables.findLast(
				(focusable) => focusable.isActive
			)?.id
			const previousFocusableId = this.findPreviousFocusable(previousState)

			return {
				activeFocusId: previousFocusableId ?? lastFocusableId,
			}
		})
	}

	addFocusable = (id: string, { autoFocus }: { autoFocus: boolean }): void => {
		this.setState((previousState) => {
			let nextFocusId = previousState.activeFocusId

			if (!nextFocusId && autoFocus) {
				nextFocusId = id
			}

			return {
				activeFocusId: nextFocusId,
				focusables: [
					...previousState.focusables,
					{
						id,
						isActive: true,
					},
				],
			}
		})
	}

	removeFocusable = (id: string): void => {
		this.setState((previousState) => ({
			activeFocusId:
				previousState.activeFocusId === id
					? undefined
					: previousState.activeFocusId,
			focusables: previousState.focusables.filter((focusable) => {
				return focusable.id !== id
			}),
		}))
	}

	activateFocusable = (id: string): void => {
		this.setState((previousState) => ({
			focusables: previousState.focusables.map((focusable) => {
				if (focusable.id !== id) {
					return focusable
				}

				return {
					id,
					isActive: true,
				}
			}),
		}))
	}

	deactivateFocusable = (id: string): void => {
		this.setState((previousState) => ({
			activeFocusId:
				previousState.activeFocusId === id
					? undefined
					: previousState.activeFocusId,
			focusables: previousState.focusables.map((focusable) => {
				if (focusable.id !== id) {
					return focusable
				}

				return {
					id,
					isActive: false,
				}
			}),
		}))
	}

	findNextFocusable = (state: IState): string | undefined => {
		const activeIndex = state.focusables.findIndex((focusable) => {
			return focusable.id === state.activeFocusId
		})

		for (
			let index = activeIndex + 1;
			index < state.focusables.length;
			index++
		) {
			const focusable = state.focusables[index]

			if (focusable?.isActive) {
				return focusable.id
			}
		}

		return undefined
	}

	findPreviousFocusable = (state: IState): string | undefined => {
		const activeIndex = state.focusables.findIndex((focusable) => {
			return focusable.id === state.activeFocusId
		})

		for (let index = activeIndex - 1; index >= 0; index--) {
			const focusable = state.focusables[index]

			if (focusable?.isActive) {
				return focusable.id
			}
		}

		return undefined
	}
}

export type {
	IProps as Props,
	IState as State,
	IFocusable as Focusable,
} from './types'
