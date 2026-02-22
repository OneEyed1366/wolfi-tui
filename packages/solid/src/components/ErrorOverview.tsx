import * as fs from 'node:fs'
import { cwd } from 'node:process'
import { type JSX, For, Show } from 'solid-js'
import StackUtils from 'stack-utils'
import codeExcerpt, { type CodeExcerpt } from 'code-excerpt'
import { Box } from './Box'
import { Text } from './Text'

//#region Types
export interface IErrorOverviewProps {
	/**
	 * The error object to display.
	 */
	error: Error
}
//#endregion Types

//#region Helpers
const cleanupPath = (path: string | undefined): string | undefined => {
	return path?.replace(`file://${cwd()}/`, '')
}

const stackUtils = new StackUtils({
	cwd: cwd(),
	internals: StackUtils.nodeInternals(),
})
//#endregion Helpers

//#region Component
/**
 * `<ErrorOverview>` displays an error with its stack trace and code context.
 * It parses the error stack, extracts file locations, and shows surrounding code.
 */
export function ErrorOverview(props: IErrorOverviewProps): JSX.Element {
	const stack = () =>
		props.error.stack ? props.error.stack.split('\n').slice(1) : undefined

	const origin = () => {
		const s = stack()
		return s ? stackUtils.parseLine(s[0]!) : undefined
	}

	const filePath = () => cleanupPath(origin()?.file)

	const excerptData = (): { excerpt: CodeExcerpt[]; lineWidth: number } | undefined => {
		const fp = filePath()
		const orig = origin()
		if (fp && orig?.line && fs.existsSync(fp)) {
			const sourceCode = fs.readFileSync(fp, 'utf8')
			const excerpt = codeExcerpt(sourceCode, orig.line)
			if (excerpt) {
				let lineWidth = 0
				for (const { line } of excerpt) {
					lineWidth = Math.max(lineWidth, String(line).length)
				}
				return { excerpt, lineWidth }
			}
		}
		return undefined
	}

	return (
		<Box style={{ flexDirection: 'column', padding: 1 }}>
			<Box>
				<Text style={{ backgroundColor: 'red', color: 'white' }}>
					{' '}ERROR{' '}
				</Text>
				<Text> {props.error.message}</Text>
			</Box>

			<Show when={origin() && filePath()}>
				<Box style={{ marginTop: 1 }}>
					<Text style={{ color: 'gray' }}>
						{filePath()}:{origin()!.line}:{origin()!.column}
					</Text>
				</Box>
			</Show>

			<Show when={origin() && excerptData()}>
				<Box style={{ marginTop: 1, flexDirection: 'column' }}>
					<For each={excerptData()!.excerpt}>
						{({ line, value }) => (
							<Box>
								<Box style={{ width: excerptData()!.lineWidth + 1 }}>
									<Text
										style={{
											color: line === origin()!.line ? 'white' : 'gray',
											backgroundColor:
												line === origin()!.line ? 'red' : undefined,
										}}
										aria-label={
											line === origin()!.line
												? `Line ${line}, error`
												: `Line ${line}`
										}
									>
										{String(line).padStart(excerptData()!.lineWidth, ' ')}:
									</Text>
								</Box>
								<Text
									style={{
										backgroundColor: line === origin()!.line ? 'red' : undefined,
										color: line === origin()!.line ? 'white' : undefined,
									}}
								>
									{' ' + value}
								</Text>
							</Box>
						)}
					</For>
				</Box>
			</Show>

			<Show when={props.error.stack}>
				<Box style={{ marginTop: 1, flexDirection: 'column' }}>
					<For
						each={props.error.stack!.split('\n').slice(1).map((line, index) => ({
							line,
							index,
							parsed: stackUtils.parseLine(line),
						}))}
					>
						{({ line, index, parsed }) => (
							<Show
								when={parsed}
								fallback={
									<Box>
										<Text style={{ color: 'gray' }}>- </Text>
										<Text style={{ color: 'gray', fontWeight: 'bold' }}>
											{line}
											{'\t '}
										</Text>
									</Box>
								}
							>
								<Box>
									<Text style={{ color: 'gray' }}>- </Text>
									<Text style={{ color: 'gray', fontWeight: 'bold' }}>
										{parsed!.function}
									</Text>
									<Text
										style={{ color: 'gray' }}
										aria-label={`at ${
											cleanupPath(parsed!.file) ?? ''
										} line ${parsed!.line} column ${parsed!.column}`}
									>
										{' '}
										({cleanupPath(parsed!.file) ?? ''}:{parsed!.line}:
										{parsed!.column})
									</Text>
								</Box>
							</Show>
						)}
					</For>
				</Box>
			</Show>
		</Box>
	)
}
//#endregion Component

export type { IErrorOverviewProps as Props, IErrorOverviewProps as IProps }
