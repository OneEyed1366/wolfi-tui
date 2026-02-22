import { describe, it, expect, vi } from 'vitest'
import type { LayoutTree, LayoutStyle, ComputedLayout } from './layout-types'
import { LoggedLayoutTree } from './layout-logger'
import { createLogger } from './logger'

// WHY: stub all LayoutTree methods — TaffyLayoutTree is a native NAPI module,
// cannot be instantiated in unit tests without the .node binary in the right place
function makeInnerStub(): LayoutTree {
	const layout: ComputedLayout = {
		x: 0,
		y: 0,
		width: 80,
		height: 24,
		paddingTop: 0,
		paddingRight: 0,
		paddingBottom: 0,
		paddingLeft: 0,
		borderTop: 0,
		borderRight: 0,
		borderBottom: 0,
		borderLeft: 0,
	}
	return {
		createNode: vi.fn().mockReturnValue(42),
		insertChild: vi.fn(),
		removeChild: vi.fn(),
		removeNode: vi.fn(),
		setStyle: vi.fn(),
		setTextDimensions: vi.fn(),
		markDirty: vi.fn(),
		setDisplayNone: vi.fn(),
		setDisplayFlex: vi.fn(),
		computeLayout: vi.fn(),
		getLayout: vi.fn().mockReturnValue(layout),
		getChildCount: vi.fn().mockReturnValue(3),
	}
}

describe('LoggedLayoutTree', () => {
	it('delegates createNode and returns inner result', () => {
		const inner = makeInnerStub()
		const log = createLogger(false, '/dev/null')
		const tree = new LoggedLayoutTree(inner, log)
		const id = tree.createNode({ flexDirection: 'column' } as LayoutStyle)
		expect(inner.createNode).toHaveBeenCalledWith({ flexDirection: 'column' })
		expect(id).toBe(42)
	})

	it('delegates insertChild', () => {
		const inner = makeInnerStub()
		const tree = new LoggedLayoutTree(inner, createLogger(false, '/dev/null'))
		tree.insertChild(1, 2, 0)
		expect(inner.insertChild).toHaveBeenCalledWith(1, 2, 0)
	})

	it('logs computeLayout with durationMs', () => {
		const inner = makeInnerStub()
		const events: unknown[] = []
		// WHY: inject a spy logger instead of the global singleton to isolate test
		const spyLogger = {
			enabled: true as const,
			log: (e: unknown) => events.push(e),
			flush: () => {},
		}
		const tree = new LoggedLayoutTree(inner, spyLogger)
		tree.computeLayout(0, 80)
		const [callRoot, callWidth] = (
			inner.computeLayout as ReturnType<typeof vi.fn>
		).mock.calls[0]!
		expect(callRoot).toBe(0)
		expect(callWidth).toBe(80)
		const evt = events[0] as { cat: string; op: string; durationMs: number }
		expect(evt.cat).toBe('layout')
		expect(evt.op).toBe('computeLayout')
		expect(typeof evt.durationMs).toBe('number')
	})

	it('logs setStyle with keys array not values', () => {
		const inner = makeInnerStub()
		const events: unknown[] = []
		const spyLogger = {
			enabled: true as const,
			log: (e: unknown) => events.push(e),
			flush: () => {},
		}
		const tree = new LoggedLayoutTree(inner, spyLogger)
		tree.setStyle(3, {
			flexDirection: 'column',
			width: { value: 80, unit: 'px' },
		} as LayoutStyle)
		const evt = events[0] as { keys: string[] }
		// WHY: log only keys, not values — values can be large style objects that bloat the log
		expect(evt.keys).toEqual(expect.arrayContaining(['flexDirection', 'width']))
		expect((evt as { value?: unknown }).value).toBeUndefined()
	})

	it('does not log when logger is disabled', () => {
		const inner = makeInnerStub()
		const events: unknown[] = []
		const spyLogger = {
			enabled: false as const,
			log: (e: unknown) => events.push(e),
			flush: () => {},
		}
		const tree = new LoggedLayoutTree(inner, spyLogger)
		tree.createNode({} as LayoutStyle)
		tree.computeLayout(0, 80)
		// WHY: verify zero events when disabled — noop logger must be truly silent
		expect(events).toHaveLength(0)
	})
})
