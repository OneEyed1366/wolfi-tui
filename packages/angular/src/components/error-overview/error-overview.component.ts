import * as fs from 'node:fs'
import { cwd } from 'node:process'
import {
	Component,
	Input,
	ChangeDetectionStrategy,
	computed,
	signal,
} from '@angular/core'
import StackUtils from 'stack-utils'
import codeExcerpt, { type CodeExcerpt } from 'code-excerpt'
import { BoxComponent } from '../box/box.component'
import { TextComponent } from '../text/text.component'

//#region Types
export interface ErrorOverviewProps {
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

interface ParsedStackFrame {
	function?: string
	file?: string
	line?: number
	column?: number
}

interface ExcerptData {
	excerpt: CodeExcerpt[]
	lineWidth: number
	originLine: number
}
//#endregion Helpers

//#region Component
/**
 * `<w-error-overview>` displays an error with its stack trace and code context.
 * It parses the error stack, extracts file locations, and shows surrounding code.
 */
@Component({
	selector: 'w-error-overview',
	standalone: true,
	imports: [BoxComponent, TextComponent],
	changeDetection: ChangeDetectionStrategy.OnPush,
	template: `
		<w-box [style]="containerStyle">
			<!-- Error Header -->
			<w-box>
				<w-text [style]="errorBadgeStyle"> ERROR </w-text>
				<w-text> {{ errorMessage() }}</w-text>
			</w-box>

			<!-- File Location -->
			@if (filePath() && origin()) {
				<w-box [style]="{ marginTop: 1 }">
					<w-text [style]="grayStyle"
						>{{ filePath() }}:{{ origin()?.line }}:{{
							origin()?.column
						}}</w-text
					>
				</w-box>
			}

			<!-- Code Excerpt -->
			@if (excerptData()) {
				<w-box [style]="columnStyle">
					@for (item of excerptData()!.excerpt; track item.line) {
						<w-box>
							<w-box [style]="{ width: excerptData()!.lineWidth + 1 }">
								<w-text
									[style]="getLineNumberStyle(item.line)"
									[attr.aria-label]="
										item.line === excerptData()!.originLine
											? 'Line ' + item.line + ', error'
											: 'Line ' + item.line
									"
									>{{ padLine(item.line) }}:</w-text
								>
							</w-box>
							<w-text [style]="getLineContentStyle(item.line)">
								{{ item.value }}</w-text
							>
						</w-box>
					}
				</w-box>
			}

			<!-- Stack Trace -->
			@if (stackLines().length > 0) {
				<w-box [style]="columnStyle">
					@for (frame of parsedFrames(); track $index) {
						<w-box>
							<w-text [style]="grayStyle">- </w-text>
							@if (frame.function) {
								<w-text [style]="grayBoldStyle">{{ frame.function }}</w-text>
								<w-text
									[style]="grayStyle"
									[attr.aria-label]="
										'at ' +
										(frame.file ?? '') +
										' line ' +
										frame.line +
										' column ' +
										frame.column
									"
								>
									({{ frame.file ?? '' }}:{{ frame.line }}:{{
										frame.column
									}})</w-text
								>
							} @else {
								<w-text [style]="grayBoldStyle">{{ frame.raw }} </w-text>
							}
						</w-box>
					}
				</w-box>
			}
		</w-box>
	`,
})
export class ErrorOverviewComponent {
	//#region Inputs
	@Input({ required: true })
	set error(value: Error) {
		this._error.set(value)
	}
	//#endregion Inputs

	//#region Internal State
	private _error = signal<Error>(new Error(''))
	//#endregion Internal State

	//#region Styles
	readonly containerStyle = { flexDirection: 'column' as const, padding: 1 }
	readonly errorBadgeStyle = { backgroundColor: 'red', color: 'white' }
	readonly grayStyle = { color: 'gray' }
	readonly grayBoldStyle = { color: 'gray', fontWeight: 'bold' as const }
	readonly columnStyle = { marginTop: 1, flexDirection: 'column' as const }
	//#endregion Styles

	//#region Computed Properties
	readonly errorMessage = computed(() => this._error().message)

	readonly stackLines = computed((): string[] => {
		const stack = this._error().stack
		if (!stack) return []
		return stack.split('\n').slice(1)
	})

	readonly origin = computed((): ParsedStackFrame | undefined => {
		const lines = this.stackLines()
		if (lines.length === 0) return undefined
		return stackUtils.parseLine(lines[0]!) as ParsedStackFrame | undefined
	})

	readonly filePath = computed((): string | undefined => {
		const orig = this.origin()
		return cleanupPath(orig?.file)
	})

	readonly excerptData = computed((): ExcerptData | null => {
		const orig = this.origin()
		const path = this.filePath()

		if (!path || !orig?.line) return null

		try {
			if (!fs.existsSync(path)) return null

			const sourceCode = fs.readFileSync(path, 'utf8')
			const excerpt = codeExcerpt(sourceCode, orig.line)

			if (!excerpt) return null

			let lineWidth = 0
			for (const { line } of excerpt) {
				lineWidth = Math.max(lineWidth, String(line).length)
			}

			return {
				excerpt,
				lineWidth,
				originLine: orig.line,
			}
		} catch {
			return null
		}
	})

	readonly parsedFrames = computed(
		(): Array<ParsedStackFrame & { raw?: string }> => {
			return this.stackLines().map((line) => {
				const parsed = stackUtils.parseLine(line) as ParsedStackFrame | null
				if (!parsed) {
					return { raw: line }
				}
				return {
					...parsed,
					file: cleanupPath(parsed.file),
				}
			})
		}
	)
	//#endregion Computed Properties

	//#region Helper Methods
	padLine(line: number): string {
		const data = this.excerptData()
		if (!data) return String(line)
		return String(line).padStart(data.lineWidth, ' ')
	}

	getLineNumberStyle(line: number): Record<string, string | undefined> {
		const data = this.excerptData()
		const isErrorLine = data && line === data.originLine
		return {
			color: isErrorLine ? 'white' : 'gray',
			backgroundColor: isErrorLine ? 'red' : undefined,
		}
	}

	getLineContentStyle(line: number): Record<string, string | undefined> {
		const data = this.excerptData()
		const isErrorLine = data && line === data.originLine
		return {
			color: isErrorLine ? 'white' : undefined,
			backgroundColor: isErrorLine ? 'red' : undefined,
		}
	}
	//#endregion Helper Methods
}
//#endregion Component

export type { ErrorOverviewProps as Props, ErrorOverviewProps as IProps }
