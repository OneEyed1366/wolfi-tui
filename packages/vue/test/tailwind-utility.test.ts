import { test, expect, beforeEach } from 'vitest'
import {
	clearGlobalStyles,
	resolveClassName,
	registerStyles,
} from '@wolfie/shared'

beforeEach(() => {
	clearGlobalStyles()
})

test('recognizes standard tailwind utilities', () => {
	// These should be recognized as tailwind utilities even without registration
	// because they match the prefixes or static list.

	// Let's test resolveClassName with a mix of registered and tailwind classes
	registerStyles({
		btn: { padding: 1 },
		primary: { color: 'blue' },
	})

	// 'btn primary' should be compound-looked up if they are NOT tailwind utilities
	// If they ARE recognized as tailwind utilities, it would return {padding:1, color:'blue'}
	// because it treats them as separate tokens and merges them.

	// Case 1: 'w-full btn' -> since w-full is tailwind, it won't try 'w-full.btn'.
	const style = resolveClassName('w-full btn')
	expect(style).toEqual({ padding: 1 })
})

test('handles variants and arbitrary values', () => {
	// These are now handled by the improved isTailwindUtility
	registerStyles({
		'bg-red-500': { backgroundColor: 'red' },
	})

	expect(resolveClassName('hover:bg-red-500')).toEqual({
		backgroundColor: 'red',
	})
	expect(resolveClassName('bg-[#00ff00]')).toEqual({}) // recognized as utility, but not registered
})

test('handles negative utilities', () => {
	registerStyles({
		'-m-1': { margin: -1 },
	})
	expect(resolveClassName('-m-1')).toEqual({ margin: -1 })
})

test('recognizes new v4 utilities', () => {
	// 'size-4' is a new v4 utility for width+height
	registerStyles({
		'size-4': { width: 4, height: 4 },
	})
	expect(resolveClassName('size-4')).toEqual({ width: 4, height: 4 })
})
