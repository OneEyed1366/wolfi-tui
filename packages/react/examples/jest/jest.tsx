import React from 'react'
import PQueue from 'p-queue'
import delay from 'delay'
import ms from 'ms'
import render from '../../src/render'
import { Static, Box } from '../../src/index'
import Summary from './summaryx'
import Test from './test'

const paths = [
	'tests/login',
	'tests/signup',
	'tests/forgot-password',
	'tests/reset-password',
	'tests/view-profile',
	'tests/edit-profile',
	'tests/delete-profile',
	'tests/posts',
	'tests/post',
	'tests/comments',
]

type State = {
	startTime: number
	completedTests: Array<{
		path: string
		status: string
	}>
	runningTests: Array<{
		path: string
		status: string
	}>
}

class Jest extends React.Component<Record<string, unknown>, State> {
	constructor(properties: Record<string, unknown>) {
		super(properties)

		this.state = {
			startTime: Date.now(),
			completedTests: [],
			runningTests: [],
		}
	}

	render() {
		const { startTime, completedTests, runningTests } = this.state

		return (
			<Box flexDirection="column">
				<Static items={completedTests}>
					{(test) => (
						<Test key={test.path} status={test.status} path={test.path} />
					)}
				</Static>

				{runningTests.length > 0 && (
					<Box flexDirection="column" marginTop={1}>
						{runningTests.map((test) => (
							<Test key={test.path} status={test.status} path={test.path} />
						))}
					</Box>
				)}

				<Summary
					isFinished={runningTests.length === 0}
					passed={
						completedTests.filter((test) => test.status === 'pass').length
					}
					failed={
						completedTests.filter((test) => test.status === 'fail').length
					}
					time={ms(Date.now() - startTime)}
				/>
			</Box>
		)
	}

	componentDidMount() {
		const queue = new PQueue({ concurrency: 4 })

		for (const path of paths) {
			void queue.add(this.runTest.bind(this, path))
		}
	}

	async runTest(path: string) {
		this.setState((previousState) => ({
			runningTests: [
				...previousState.runningTests,
				{
					status: 'runs',
					path,
				},
			],
		}))

		await delay(1000 * Math.random())

		this.setState((previousState) => ({
			runningTests: previousState.runningTests.filter(
				(test) => test.path !== path
			),
			completedTests: [
				...previousState.completedTests,
				{
					status: Math.random() < 0.5 ? 'pass' : 'fail',
					path,
				},
			],
		}))
	}
}

render(<Jest />)
