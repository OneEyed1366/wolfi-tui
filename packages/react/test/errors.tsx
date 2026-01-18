import React from 'react';
import test from 'ava';
import patchConsole from 'patch-console';
import stripAnsi from 'strip-ansi';
import {render} from '@wolfie/react';
import createStdout from './helpers/create-stdout.js';

let restore = () => {};

test.before(() => {
	restore = patchConsole(() => {});
});

test.after(() => {
	restore();
});

test('catch and display error', t => {
	const stdout = createStdout();

	const Test = () => {
		throw new Error('Oh no');
	};

	render(<Test />, {stdout});

	const lines = stripAnsi((stdout.write as any).lastCall.args[0] as string)
		.split('\n')
		.slice(0, 14);

	// Normalize paths to handle both absolute and relative
	const normalizedLines = lines.map(line =>
		line.replace(/\/[^\s)]+\/test\/errors\.tsx/g, 'test/errors.tsx'),
	);

	t.deepEqual(normalizedLines, [
		'',
		'  ERROR  Oh no',
		'',
		' test/errors.tsx:22:9',
		'',
		' 19:   const stdout = createStdout();',
		' 20:',
		' 21:   const Test = () => {',
		" 22:     throw new Error('Oh no');",
		' 23:   };',
		' 24:',
		' 25:   render(<Test />, {stdout});',
		'',
		' - Test (test/errors.tsx:22:9)',
	]);
});
