import React from 'react'
import { test, expect } from 'vitest'
import boxen from 'boxen'
import indentString from 'indent-string'
import cliBoxes from 'cli-boxes'
import chalk from 'chalk'
import { render, Box, Text } from '@wolfie/react'
import { renderToString } from './helpers/render-to-string.js'
import createStdout from './helpers/create-stdout.js'

test('single node - full width box', () => {
	const output = renderToString(
		<Box borderStyle="round">
			<Text>Hello World</Text>
		</Box>
	)

	expect(output).toBe(
		boxen('Hello World', { width: 100, borderStyle: 'round' })
	)
})

test('single node - full width box with colorful border', () => {
	const output = renderToString(
		<Box borderStyle="round" borderColor="green">
			<Text>Hello World</Text>
		</Box>
	)

	expect(output).toBe(
		boxen('Hello World', {
			width: 100,
			borderStyle: 'round',
			borderColor: 'green',
		})
	)
})

test('single node - fit-content box', () => {
	const output = renderToString(
		<Box borderStyle="round" alignSelf="flex-start">
			<Text>Hello World</Text>
		</Box>
	)

	expect(output).toBe(boxen('Hello World', { borderStyle: 'round' }))
})

test('single node - fit-content box with wide characters', () => {
	const output = renderToString(
		<Box borderStyle="round" alignSelf="flex-start">
			<Text>こんにちは</Text>
		</Box>
	)

	expect(output).toBe(boxen('こんにちは', { borderStyle: 'round' }))
})

test('single node - fit-content box with emojis', () => {
	const output = renderToString(
		<Box borderStyle="round" alignSelf="flex-start">
			<Text>🌊🌊</Text>
		</Box>
	)

	expect(output).toBe(boxen('🌊🌊', { borderStyle: 'round' }))
})

test('single node - fixed width box', () => {
	const output = renderToString(
		<Box borderStyle="round" width={20}>
			<Text>Hello World</Text>
		</Box>
	)

	expect(output).toBe(
		boxen('Hello World'.padEnd(18, ' '), { borderStyle: 'round' })
	)
})

test('single node - fixed width and height box', () => {
	const output = renderToString(
		<Box borderStyle="round" width={20} height={20}>
			<Text>Hello World</Text>
		</Box>
	)

	expect(output).toBe(
		boxen('Hello World'.padEnd(18, ' ') + '\n'.repeat(17), {
			borderStyle: 'round',
		})
	)
})

test('single node - box with padding', () => {
	const output = renderToString(
		<Box borderStyle="round" padding={1} alignSelf="flex-start">
			<Text>Hello World</Text>
		</Box>
	)

	expect(output).toBe(boxen('\n Hello World \n', { borderStyle: 'round' }))
})

test('single node - box with horizontal alignment', () => {
	const output = renderToString(
		<Box borderStyle="round" width={20} justifyContent="center">
			<Text>Hello World</Text>
		</Box>
	)

	expect(output).toBe(boxen('   Hello World    ', { borderStyle: 'round' }))
})

test('single node - box with vertical alignment', () => {
	const output = renderToString(
		<Box
			borderStyle="round"
			height={20}
			alignItems="center"
			alignSelf="flex-start"
		>
			<Text>Hello World</Text>
		</Box>
	)

	expect(output).toBe(
		boxen('\n'.repeat(8) + 'Hello World' + '\n'.repeat(9), {
			borderStyle: 'round',
		})
	)
})

test('single node - box with wrapping', () => {
	const output = renderToString(
		<Box borderStyle="round" width={10}>
			<Text>Hello World</Text>
		</Box>
	)

	expect(output).toBe(boxen('Hello   \nWorld', { borderStyle: 'round' }))
})

test('multiple nodes - full width box', () => {
	const output = renderToString(
		<Box borderStyle="round">
			<Text>{'Hello '}World</Text>
		</Box>
	)

	expect(output).toBe(
		boxen('Hello World', { width: 100, borderStyle: 'round' })
	)
})

test('multiple nodes - full width box with colorful border', () => {
	const output = renderToString(
		<Box borderStyle="round" borderColor="green">
			<Text>{'Hello '}World</Text>
		</Box>
	)

	expect(output).toBe(
		boxen('Hello World', {
			width: 100,
			borderStyle: 'round',
			borderColor: 'green',
		})
	)
})

test('multiple nodes - fit-content box', () => {
	const output = renderToString(
		<Box borderStyle="round" alignSelf="flex-start">
			<Text>{'Hello '}World</Text>
		</Box>
	)

	expect(output).toBe(boxen('Hello World', { borderStyle: 'round' }))
})

test('multiple nodes - fixed width box', () => {
	const output = renderToString(
		<Box borderStyle="round" width={20}>
			<Text>{'Hello '}World</Text>
		</Box>
	)
	expect(output).toBe(
		boxen('Hello World'.padEnd(18, ' '), { borderStyle: 'round' })
	)
})

test('multiple nodes - fixed width and height box', () => {
	const output = renderToString(
		<Box borderStyle="round" width={20} height={20}>
			<Text>{'Hello '}World</Text>
		</Box>
	)
	expect(output).toBe(
		boxen('Hello World'.padEnd(18, ' ') + '\n'.repeat(17), {
			borderStyle: 'round',
		})
	)
})

test('multiple nodes - box with padding', () => {
	const output = renderToString(
		<Box borderStyle="round" padding={1} alignSelf="flex-start">
			<Text>{'Hello '}World</Text>
		</Box>
	)

	expect(output).toBe(boxen('\n Hello World \n', { borderStyle: 'round' }))
})

test('multiple nodes - box with horizontal alignment', () => {
	const output = renderToString(
		<Box borderStyle="round" width={20} justifyContent="center">
			<Text>{'Hello '}World</Text>
		</Box>
	)

	expect(output).toBe(boxen('   Hello World    ', { borderStyle: 'round' }))
})

test('multiple nodes - box with vertical alignment', () => {
	const output = renderToString(
		<Box
			borderStyle="round"
			height={20}
			alignItems="center"
			alignSelf="flex-start"
		>
			<Text>{'Hello '}World</Text>
		</Box>
	)

	expect(output).toBe(
		boxen('\n'.repeat(8) + 'Hello World' + '\n'.repeat(9), {
			borderStyle: 'round',
		})
	)
})

test('multiple nodes - box with wrapping', () => {
	const output = renderToString(
		<Box borderStyle="round" width={10}>
			<Text>{'Hello '}World</Text>
		</Box>
	)

	expect(output).toBe(boxen('Hello   \nWorld', { borderStyle: 'round' }))
})

test('multiple nodes - box with wrapping and long first node', () => {
	const output = renderToString(
		<Box borderStyle="round" width={10}>
			<Text>{'Helloooooo'} World</Text>
		</Box>
	)

	expect(output).toBe(boxen('Helloooo\noo World', { borderStyle: 'round' }))
})

test('multiple nodes - box with wrapping and very long first node', () => {
	const output = renderToString(
		<Box borderStyle="round" width={10}>
			<Text>{'Hellooooooooooooo'} World</Text>
		</Box>
	)

	expect(output).toBe(
		boxen('Helloooo\noooooooo\no World', { borderStyle: 'round' })
	)
})

test('nested boxes', () => {
	const output = renderToString(
		<Box borderStyle="round" width={40} padding={1}>
			<Box borderStyle="round" justifyContent="center" padding={1}>
				<Text>Hello World</Text>
			</Box>
		</Box>
	)

	const nestedBox = indentString(
		boxen('\n Hello World \n', { borderStyle: 'round' }),
		1
	)

	expect(output).toBe(
		boxen(`${' '.repeat(38)}\n${nestedBox}\n`, { borderStyle: 'round' })
	)
})

test('nested boxes - fit-content box with wide characters on flex-direction row', () => {
	const output = renderToString(
		<Box borderStyle="round" alignSelf="flex-start">
			<Box borderStyle="round">
				<Text>ミスター</Text>
			</Box>
			<Box borderStyle="round">
				<Text>スポック</Text>
			</Box>
			<Box borderStyle="round">
				<Text>カーク船長</Text>
			</Box>
		</Box>
	)

	const box1 = boxen('ミスター', { borderStyle: 'round' })
	const box2 = boxen('スポック', { borderStyle: 'round' })
	const box3 = boxen('カーク船長', { borderStyle: 'round' })

	const expected = boxen(
		box1
			.split('\n')
			.map(
				(line, index) =>
					line + box2.split('\n')[index]! + box3.split('\n')[index]!
			)
			.join('\n'),
		{ borderStyle: 'round' }
	)

	expect(output).toBe(expected)
})

test('nested boxes - fit-content box with emojis on flex-direction row', () => {
	const output = renderToString(
		<Box borderStyle="round" alignSelf="flex-start">
			<Box borderStyle="round">
				<Text>🦾</Text>
			</Box>
			<Box borderStyle="round">
				<Text>🌏</Text>
			</Box>
			<Box borderStyle="round">
				<Text>😋</Text>
			</Box>
		</Box>
	)

	const box1 = boxen('🦾', { borderStyle: 'round' })
	const box2 = boxen('🌏', { borderStyle: 'round' })
	const box3 = boxen('😋', { borderStyle: 'round' })

	const expected = boxen(
		box1
			.split('\n')
			.map(
				(line, index) =>
					line + box2.split('\n')[index]! + box3.split('\n')[index]!
			)
			.join('\n'),
		{ borderStyle: 'round' }
	)

	expect(output).toBe(expected)
})

test('nested boxes - fit-content box with wide characters on flex-direction column', () => {
	const output = renderToString(
		<Box borderStyle="round" alignSelf="flex-start" flexDirection="column">
			<Box borderStyle="round">
				<Text>ミスター</Text>
			</Box>
			<Box borderStyle="round">
				<Text>スポック</Text>
			</Box>
			<Box borderStyle="round">
				<Text>カーク船長</Text>
			</Box>
		</Box>
	)

	const expected = boxen(
		boxen('ミスター  ', { borderStyle: 'round' }) +
			'\n' +
			boxen('スポック  ', { borderStyle: 'round' }) +
			'\n' +
			boxen('カーク船長', { borderStyle: 'round' }),
		{ borderStyle: 'round' }
	)

	expect(output).toBe(expected)
})

test('nested boxes - fit-content box with emojis on flex-direction column', () => {
	const output = renderToString(
		<Box borderStyle="round" alignSelf="flex-start" flexDirection="column">
			<Box borderStyle="round">
				<Text>🦾</Text>
			</Box>
			<Box borderStyle="round">
				<Text>🌏</Text>
			</Box>
			<Box borderStyle="round">
				<Text>😋</Text>
			</Box>
		</Box>
	)

	const expected = boxen(
		boxen('🦾', { borderStyle: 'round' }) +
			'\n' +
			boxen('🌏', { borderStyle: 'round' }) +
			'\n' +
			boxen('😋', { borderStyle: 'round' }),
		{ borderStyle: 'round' }
	)

	expect(output).toBe(expected)
})

test('render border after update', () => {
	const stdout = createStdout()

	function Test({ borderColor }: { readonly borderColor?: string }) {
		return (
			<Box borderStyle="round" borderColor={borderColor}>
				<Text>Hello World</Text>
			</Box>
		)
	}

	const { rerender } = render(<Test />, {
		stdout,
		debug: true,
	})

	expect((stdout.write as any).lastCall.args[0]).toBe(
		boxen('Hello World', { width: 100, borderStyle: 'round' })
	)

	rerender(<Test borderColor="green" />)

	expect((stdout.write as any).lastCall.args[0]).toBe(
		boxen('Hello World', {
			width: 100,
			borderStyle: 'round',
			borderColor: 'green',
		})
	)

	rerender(<Test />)

	expect((stdout.write as any).lastCall.args[0]).toBe(
		boxen('Hello World', {
			width: 100,
			borderStyle: 'round',
		})
	)
})

test('hide top border', () => {
	const output = renderToString(
		<Box flexDirection="column" alignItems="flex-start">
			<Text>Above</Text>
			<Box borderStyle="round" borderTop={false}>
				<Text>Content</Text>
			</Box>
			<Text>Below</Text>
		</Box>
	)

	expect(output).toBe(
		[
			'Above',
			`${cliBoxes.round.left}Content${cliBoxes.round.right}`,
			`${cliBoxes.round.bottomLeft}${cliBoxes.round.bottom.repeat(7)}${
				cliBoxes.round.bottomRight
			}`,
			'Below',
		].join('\n')
	)
})

test('hide bottom border', () => {
	const output = renderToString(
		<Box flexDirection="column" alignItems="flex-start">
			<Text>Above</Text>
			<Box borderStyle="round" borderBottom={false}>
				<Text>Content</Text>
			</Box>
			<Text>Below</Text>
		</Box>
	)

	expect(output).toBe(
		[
			'Above',
			`${cliBoxes.round.topLeft}${cliBoxes.round.top.repeat(7)}${
				cliBoxes.round.topRight
			}`,
			`${cliBoxes.round.left}Content${cliBoxes.round.right}`,
			'Below',
		].join('\n')
	)
})

test('hide top and bottom borders', () => {
	const output = renderToString(
		<Box flexDirection="column" alignItems="flex-start">
			<Text>Above</Text>
			<Box borderStyle="round" borderTop={false} borderBottom={false}>
				<Text>Content</Text>
			</Box>
			<Text>Below</Text>
		</Box>
	)

	expect(output).toBe(
		[
			'Above',
			`${cliBoxes.round.left}Content${cliBoxes.round.right}`,
			'Below',
		].join('\n')
	)
})

test('hide left border', () => {
	const output = renderToString(
		<Box flexDirection="column" alignItems="flex-start">
			<Text>Above</Text>
			<Box borderStyle="round" borderLeft={false}>
				<Text>Content</Text>
			</Box>
			<Text>Below</Text>
		</Box>
	)

	expect(output).toBe(
		[
			'Above',
			`${cliBoxes.round.top.repeat(7)}${cliBoxes.round.topRight}`,
			`Content${cliBoxes.round.right}`,
			`${cliBoxes.round.bottom.repeat(7)}${cliBoxes.round.bottomRight}`,
			'Below',
		].join('\n')
	)
})

test('hide right border', () => {
	const output = renderToString(
		<Box flexDirection="column" alignItems="flex-start">
			<Text>Above</Text>
			<Box borderStyle="round" borderRight={false}>
				<Text>Content</Text>
			</Box>
			<Text>Below</Text>
		</Box>
	)

	expect(output).toBe(
		[
			'Above',
			`${cliBoxes.round.topLeft}${cliBoxes.round.top.repeat(7)}`,
			`${cliBoxes.round.left}Content`,
			`${cliBoxes.round.bottomLeft}${cliBoxes.round.bottom.repeat(7)}`,
			'Below',
		].join('\n')
	)
})

test('hide left and right border', () => {
	const output = renderToString(
		<Box flexDirection="column" alignItems="flex-start">
			<Text>Above</Text>
			<Box borderStyle="round" borderLeft={false} borderRight={false}>
				<Text>Content</Text>
			</Box>
			<Text>Below</Text>
		</Box>
	)

	expect(output).toBe(
		[
			'Above',
			cliBoxes.round.top.repeat(7),
			'Content',
			cliBoxes.round.bottom.repeat(7),
			'Below',
		].join('\n')
	)
})

test('hide all borders', () => {
	const output = renderToString(
		<Box flexDirection="column" alignItems="flex-start">
			<Text>Above</Text>
			<Box
				borderStyle="round"
				borderTop={false}
				borderBottom={false}
				borderLeft={false}
				borderRight={false}
			>
				<Text>Content</Text>
			</Box>
			<Text>Below</Text>
		</Box>
	)

	expect(output).toBe(['Above', 'Content', 'Below'].join('\n'))
})

test('change color of top border', () => {
	const output = renderToString(
		<Box flexDirection="column" alignItems="flex-start">
			<Text>Above</Text>
			<Box borderStyle="round" borderTopColor="green">
				<Text>Content</Text>
			</Box>
			<Text>Below</Text>
		</Box>
	)

	expect(output).toBe(
		[
			'Above',
			chalk.green(
				`${cliBoxes.round.topLeft}${cliBoxes.round.top.repeat(7)}${
					cliBoxes.round.topRight
				}`
			),
			`${cliBoxes.round.left}Content${cliBoxes.round.right}`,
			`${cliBoxes.round.bottomLeft}${cliBoxes.round.bottom.repeat(7)}${
				cliBoxes.round.bottomRight
			}`,
			'Below',
		].join('\n')
	)
})

test('change color of bottom border', () => {
	const output = renderToString(
		<Box flexDirection="column" alignItems="flex-start">
			<Text>Above</Text>
			<Box borderStyle="round" borderBottomColor="green">
				<Text>Content</Text>
			</Box>
			<Text>Below</Text>
		</Box>
	)

	expect(output).toBe(
		[
			'Above',
			`${cliBoxes.round.topLeft}${cliBoxes.round.top.repeat(7)}${
				cliBoxes.round.topRight
			}`,
			`${cliBoxes.round.left}Content${cliBoxes.round.right}`,
			chalk.green(
				`${cliBoxes.round.bottomLeft}${cliBoxes.round.bottom.repeat(7)}${
					cliBoxes.round.bottomRight
				}`
			),
			'Below',
		].join('\n')
	)
})

test('change color of left border', () => {
	const output = renderToString(
		<Box flexDirection="column" alignItems="flex-start">
			<Text>Above</Text>
			<Box borderStyle="round" borderLeftColor="green">
				<Text>Content</Text>
			</Box>
			<Text>Below</Text>
		</Box>
	)

	expect(output).toBe(
		[
			'Above',
			`${cliBoxes.round.topLeft}${cliBoxes.round.top.repeat(7)}${
				cliBoxes.round.topRight
			}`,
			`${chalk.green(cliBoxes.round.left)}Content${cliBoxes.round.right}`,
			`${cliBoxes.round.bottomLeft}${cliBoxes.round.bottom.repeat(7)}${
				cliBoxes.round.bottomRight
			}`,
			'Below',
		].join('\n')
	)
})

test('change color of right border', () => {
	const output = renderToString(
		<Box flexDirection="column" alignItems="flex-start">
			<Text>Above</Text>
			<Box borderStyle="round" borderRightColor="green">
				<Text>Content</Text>
			</Box>
			<Text>Below</Text>
		</Box>
	)

	expect(output).toBe(
		[
			'Above',
			`${cliBoxes.round.topLeft}${cliBoxes.round.top.repeat(7)}${
				cliBoxes.round.topRight
			}`,
			`${cliBoxes.round.left}Content${chalk.green(cliBoxes.round.right)}`,
			`${cliBoxes.round.bottomLeft}${cliBoxes.round.bottom.repeat(7)}${
				cliBoxes.round.bottomRight
			}`,
			'Below',
		].join('\n')
	)
})

test('custom border style', () => {
	const output = renderToString(
		<Box
			borderStyle={{
				topLeft: '↘',
				top: '↓',
				topRight: '↙',
				left: '→',
				bottomLeft: '↗',
				bottom: '↑',
				bottomRight: '↖',
				right: '←',
			}}
		>
			<Text>Content</Text>
		</Box>
	)

	expect(output).toBe(boxen('Content', { width: 100, borderStyle: 'arrow' }))
})

test('dim border color', () => {
	const output = renderToString(
		<Box borderDimColor borderStyle="round">
			<Text>Content</Text>
		</Box>
	)

	expect(output).toBe(
		boxen('Content', {
			width: 100,
			borderStyle: 'round',
			dimBorder: true,
		})
	)
})

test('dim top border color', () => {
	const output = renderToString(
		<Box flexDirection="column" alignItems="flex-start">
			<Text>Above</Text>
			<Box borderTopDimColor borderStyle="round">
				<Text>Content</Text>
			</Box>
			<Text>Below</Text>
		</Box>
	)

	expect(output).toBe(
		[
			'Above',
			chalk.dim(
				`${cliBoxes.round.topLeft}${cliBoxes.round.top.repeat(7)}${
					cliBoxes.round.topRight
				}`
			),
			`${cliBoxes.round.left}Content${cliBoxes.round.right}`,
			`${cliBoxes.round.bottomLeft}${cliBoxes.round.bottom.repeat(7)}${
				cliBoxes.round.bottomRight
			}`,
			'Below',
		].join('\n')
	)
})

test('dim bottom border color', () => {
	const output = renderToString(
		<Box flexDirection="column" alignItems="flex-start">
			<Text>Above</Text>
			<Box borderBottomDimColor borderStyle="round">
				<Text>Content</Text>
			</Box>
			<Text>Below</Text>
		</Box>
	)

	expect(output).toBe(
		[
			'Above',
			`${cliBoxes.round.topLeft}${cliBoxes.round.top.repeat(7)}${
				cliBoxes.round.topRight
			}`,
			`${cliBoxes.round.left}Content${cliBoxes.round.right}`,
			chalk.dim(
				`${cliBoxes.round.bottomLeft}${cliBoxes.round.bottom.repeat(7)}${
					cliBoxes.round.bottomRight
				}`
			),
			'Below',
		].join('\n')
	)
})

test('dim left border color', () => {
	const output = renderToString(
		<Box flexDirection="column" alignItems="flex-start">
			<Text>Above</Text>
			<Box borderLeftDimColor borderStyle="round">
				<Text>Content</Text>
			</Box>
			<Text>Below</Text>
		</Box>
	)

	expect(output).toBe(
		[
			'Above',
			`${cliBoxes.round.topLeft}${cliBoxes.round.top.repeat(7)}${
				cliBoxes.round.topRight
			}`,
			`${chalk.dim(cliBoxes.round.left)}Content${cliBoxes.round.right}`,
			`${cliBoxes.round.bottomLeft}${cliBoxes.round.bottom.repeat(7)}${
				cliBoxes.round.bottomRight
			}`,
			'Below',
		].join('\n')
	)
})

test('dim right border color', () => {
	const output = renderToString(
		<Box flexDirection="column" alignItems="flex-start">
			<Text>Above</Text>
			<Box borderRightDimColor borderStyle="round">
				<Text>Content</Text>
			</Box>
			<Text>Below</Text>
		</Box>
	)

	expect(output).toBe(
		[
			'Above',
			`${cliBoxes.round.topLeft}${cliBoxes.round.top.repeat(7)}${
				cliBoxes.round.topRight
			}`,
			`${cliBoxes.round.left}Content${chalk.dim(cliBoxes.round.right)}`,
			`${cliBoxes.round.bottomLeft}${cliBoxes.round.bottom.repeat(7)}${
				cliBoxes.round.bottomRight
			}`,
			'Below',
		].join('\n')
	)
})
