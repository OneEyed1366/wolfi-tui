import * as fs from 'node:fs'
import { cwd } from 'node:process'
import React from 'react'
import StackUtils from 'stack-utils'
import codeExcerpt, { type CodeExcerpt } from 'code-excerpt'
import { Box } from '../Box'
import { Text } from '../Text'
import type { IProps } from './types'

const cleanupPath = (path: string | undefined): string | undefined => {
	return path?.replace(`file://${cwd()}/`, '')
}

const stackUtils = new StackUtils({
	cwd: cwd(),
	internals: StackUtils.nodeInternals(),
})

export function ErrorOverview({ error }: IProps) {
	const stack = error.stack ? error.stack.split('\n').slice(1) : undefined
	const origin = stack ? stackUtils.parseLine(stack[0]!) : undefined
	const filePath = cleanupPath(origin?.file)
	let excerpt: CodeExcerpt[] | undefined
	let lineWidth = 0

	if (filePath && origin?.line && fs.existsSync(filePath)) {
		const sourceCode = fs.readFileSync(filePath, 'utf8')
		excerpt = codeExcerpt(sourceCode, origin.line)

		if (excerpt) {
			for (const { line } of excerpt) {
				lineWidth = Math.max(lineWidth, String(line).length)
			}
		}
	}

	return (
		<Box style={{ flexDirection: 'column', padding: 1 }}>
			<Box>
				<Text style={{ backgroundColor: 'red', color: 'white' }}> ERROR </Text>

				<Text> {error.message}</Text>
			</Box>

			{origin && filePath && (
				<Box style={{ marginTop: 1 }}>
					<Text style={{ color: 'gray' }}>
						{filePath}:{origin.line}:{origin.column}
					</Text>
				</Box>
			)}

			{origin && excerpt && (
				<Box style={{ marginTop: 1, flexDirection: 'column' }}>
					{excerpt.map(({ line, value }) => (
						<Box key={line}>
							<Box style={{ width: lineWidth + 1 }}>
								<Text
									style={{
										color: line === origin.line ? 'white' : 'gray',
										backgroundColor: line === origin.line ? 'red' : undefined,
									}}
									aria-label={
										line === origin.line
											? `Line ${line}, error`
											: `Line ${line}`
									}
								>
									{String(line).padStart(lineWidth, ' ')}:
								</Text>
							</Box>

							<Text
								key={line}
								style={{
									backgroundColor: line === origin.line ? 'red' : undefined,
									color: line === origin.line ? 'white' : undefined,
								}}
							>
								{' ' + value}
							</Text>
						</Box>
					))}
				</Box>
			)}

			{error.stack && (
				<Box style={{ marginTop: 1, flexDirection: 'column' }}>
					{error.stack
						.split('\n')
						.slice(1)
						.map((line) => {
							const parsedLine = stackUtils.parseLine(line)

							if (!parsedLine) {
								return (
									<Box key={line}>
										<Text style={{ color: 'gray' }}>- </Text>
										<Text style={{ color: 'gray', fontWeight: 'bold' }}>
											{line}
											\t{' '}
										</Text>
									</Box>
								)
							}

							return (
								<Box key={line}>
									<Text style={{ color: 'gray' }}>- </Text>
									<Text style={{ color: 'gray', fontWeight: 'bold' }}>
										{parsedLine.function}
									</Text>
									<Text
										style={{ color: 'gray' }}
										aria-label={`at ${
											cleanupPath(parsedLine.file) ?? ''
										} line ${parsedLine.line} column ${parsedLine.column}`}
									>
										{' '}
										({cleanupPath(parsedLine.file) ?? ''}:{parsedLine.line}:
										{parsedLine.column})
									</Text>
								</Box>
							)
						})}
				</Box>
			)}
		</Box>
	)
}

export type { IProps as Props } from './types'
export type { IProps } from './types'
