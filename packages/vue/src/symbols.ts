import type { InjectionKey } from 'vue'
import type { EventEmitter } from 'node:events'

export const StdinSymbol = Symbol('wolfie-stdin') as InjectionKey<{
	stdin: NodeJS.ReadStream
	setRawMode: (value: boolean) => void
	isRawModeSupported: boolean
	internal_exitOnCtrlC: boolean
	internal_eventEmitter: EventEmitter
}>

export const StdoutSymbol = Symbol('wolfie-stdout') as InjectionKey<{
	stdout: NodeJS.WriteStream
	write: (data: string) => void
}>

export const StderrSymbol = Symbol('wolfie-stderr') as InjectionKey<{
	stderr: NodeJS.WriteStream
	write: (data: string) => void
}>

export const AppSymbol = Symbol('wolfie-app') as InjectionKey<{
	exit: (error?: Error) => void
}>
