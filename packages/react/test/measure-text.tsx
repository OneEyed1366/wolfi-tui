import test from 'ava';
import {measureText} from '@wolfie/core';

test('measure "constructor"', t => {
	const {width} = measureText('constructor');
	t.is(width, 11);
});
