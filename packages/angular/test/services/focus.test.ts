import { describe, it, expect, beforeEach } from 'vitest'
import { FocusService } from '../../src/services/focus.service'

describe('FocusService', () => {
	let service: FocusService

	beforeEach(() => {
		service = new FocusService()
	})

	describe('addFocusable', () => {
		it('adds a focusable item', () => {
			service.addFocusable('test-1', { autoFocus: false })
			expect(service.allFocusables().length).toBe(1)
		})

		it('does not add duplicate focusables', () => {
			service.addFocusable('test-1', { autoFocus: false })
			service.addFocusable('test-1', { autoFocus: false })
			expect(service.allFocusables().length).toBe(1)
		})

		it('auto-focuses first item with autoFocus', () => {
			service.addFocusable('test-1', { autoFocus: true })
			expect(service.activeId()).toBe('test-1')
		})

		it('does not auto-focus if another element is already focused', () => {
			service.addFocusable('test-1', { autoFocus: true })
			service.addFocusable('test-2', { autoFocus: true })
			expect(service.activeId()).toBe('test-1')
		})
	})

	describe('removeFocusable', () => {
		it('removes a focusable item', () => {
			service.addFocusable('test-1', { autoFocus: false })
			service.removeFocusable('test-1')
			expect(service.allFocusables().length).toBe(0)
		})

		it('clears focus when removing focused item', () => {
			service.addFocusable('test-1', { autoFocus: true })
			service.removeFocusable('test-1')
			expect(service.activeId()).toBeUndefined()
		})
	})

	describe('focusNext/focusPrevious', () => {
		beforeEach(() => {
			service.addFocusable('a', { autoFocus: true })
			service.addFocusable('b', { autoFocus: false })
			service.addFocusable('c', { autoFocus: false })
		})

		it('focusNext cycles forward', () => {
			expect(service.activeId()).toBe('a')
			service.focusNext()
			expect(service.activeId()).toBe('b')
			service.focusNext()
			expect(service.activeId()).toBe('c')
			service.focusNext()
			expect(service.activeId()).toBe('a') // wraps
		})

		it('focusPrevious cycles backward', () => {
			expect(service.activeId()).toBe('a')
			service.focusPrevious()
			expect(service.activeId()).toBe('c') // wraps
		})

		it('focusNext focuses first when none active', () => {
			const svc = new FocusService()
			svc.addFocusable('x', { autoFocus: false })
			svc.addFocusable('y', { autoFocus: false })
			expect(svc.activeId()).toBeUndefined()
			svc.focusNext()
			expect(svc.activeId()).toBe('x')
		})

		it('focusPrevious focuses last when none active', () => {
			const svc = new FocusService()
			svc.addFocusable('x', { autoFocus: false })
			svc.addFocusable('y', { autoFocus: false })
			expect(svc.activeId()).toBeUndefined()
			svc.focusPrevious()
			expect(svc.activeId()).toBe('y')
		})
	})

	describe('focus', () => {
		it('focuses specific item by id', () => {
			service.addFocusable('a', { autoFocus: false })
			service.addFocusable('b', { autoFocus: false })
			service.focus('b')
			expect(service.activeId()).toBe('b')
		})

		it('does not focus inactive items', () => {
			service.addFocusable('a', { autoFocus: false })
			service.deactivateFocusable('a')
			service.focus('a')
			expect(service.activeId()).toBeUndefined()
		})
	})

	describe('isFocused', () => {
		it('returns true for active item', () => {
			service.addFocusable('a', { autoFocus: true })
			expect(service.isFocused('a')).toBe(true)
		})

		it('returns false for inactive item', () => {
			service.addFocusable('a', { autoFocus: false })
			expect(service.isFocused('a')).toBe(false)
		})

		it('returns false for non-existent item', () => {
			expect(service.isFocused('nonexistent')).toBe(false)
		})
	})

	describe('activateFocusable/deactivateFocusable', () => {
		it('deactivates a focusable and moves focus', () => {
			service.addFocusable('a', { autoFocus: true })
			service.addFocusable('b', { autoFocus: false })
			expect(service.activeId()).toBe('a')
			service.deactivateFocusable('a')
			expect(service.activeId()).toBe('b')
		})

		it('reactivates a deactivated focusable', () => {
			service.addFocusable('a', { autoFocus: false })
			service.deactivateFocusable('a')
			service.activateFocusable('a')
			const focusable = service.allFocusables().find((f) => f.id === 'a')
			expect(focusable?.isActive).toBe(true)
		})
	})

	describe('enableFocus/disableFocus', () => {
		it('disables focus navigation', () => {
			service.addFocusable('a', { autoFocus: true })
			service.addFocusable('b', { autoFocus: false })
			service.disableFocus()
			service.focusNext()
			expect(service.activeId()).toBe('a') // unchanged
		})

		it('re-enables focus navigation', () => {
			service.addFocusable('a', { autoFocus: true })
			service.addFocusable('b', { autoFocus: false })
			service.disableFocus()
			service.enableFocus()
			service.focusNext()
			expect(service.activeId()).toBe('b')
		})

		it('prevents focus() when disabled', () => {
			service.addFocusable('a', { autoFocus: false })
			service.addFocusable('b', { autoFocus: false })
			service.disableFocus()
			service.focus('b')
			expect(service.activeId()).toBeUndefined()
		})
	})
})
