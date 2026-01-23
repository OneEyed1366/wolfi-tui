export type IProps = {
	children: React.ReactNode
	stdin: NodeJS.ReadStream
	stdout: NodeJS.WriteStream
	stderr: NodeJS.WriteStream
	writeToStdout: (data: string) => void
	writeToStderr: (data: string) => void
	exitOnCtrlC: boolean
	onExit: (error?: Error) => void
}

export type IState = {
	isFocusEnabled: boolean
	activeFocusId?: string
	focusables: IFocusable[]
	error?: Error
}

export type IFocusable = {
	id: string
	isActive: boolean
}
