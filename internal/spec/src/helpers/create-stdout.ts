import EventEmitter from 'node:events'
import { spy } from 'sinon'

// Fake process.stdout
export type FakeStdout = {
	get: () => string
} & NodeJS.WriteStream

export const createStdout = (options?: {
	columns?: number
	rows?: number
}): FakeStdout => {
	const stdout = new EventEmitter() as unknown as FakeStdout
	stdout.columns = options?.columns ?? 100
	stdout.rows = options?.rows ?? 24

	const write = spy()
	stdout.write = write

	stdout.get = () => (write.lastCall?.args[0] as string) ?? ''

	return stdout
}
