import { Injectable, signal, computed } from '@angular/core'

//#region Types
export interface Focusable {
	id: string
	isActive: boolean
}

export interface FocusOptions {
	autoFocus?: boolean
}
//#endregion Types

//#region FocusService
/**
 * Focus management service for Wolfie Angular
 * Port from React App/index.tsx:182-335
 */
@Injectable()
export class FocusService {
	private focusables = signal<Focusable[]>([])
	private activeFocusId = signal<string | undefined>(undefined)
	private isFocusEnabled = signal(true)

	/** Readonly signal of the currently active focus ID */
	readonly activeId = computed(() => this.activeFocusId())

	/** Readonly signal of all focusables */
	readonly allFocusables = computed(() => this.focusables())

	/**
	 * Add a focusable element
	 */
	addFocusable(id: string, options: FocusOptions = {}): void {
		this.focusables.update((current) => {
			// Don't add duplicates
			if (current.some((f) => f.id === id)) {
				return current
			}
			return [...current, { id, isActive: true }]
		})

		// Auto-focus if requested and no other element is focused
		if (options.autoFocus && this.activeFocusId() === undefined) {
			this.activeFocusId.set(id)
		}
	}

	/**
	 * Remove a focusable element
	 */
	removeFocusable(id: string): void {
		this.focusables.update((current) => current.filter((f) => f.id !== id))

		// If the removed element was focused, clear focus
		if (this.activeFocusId() === id) {
			this.activeFocusId.set(undefined)
		}
	}

	/**
	 * Activate a focusable element (make it eligible for focus)
	 */
	activateFocusable(id: string): void {
		this.focusables.update((current) =>
			current.map((f) => (f.id === id ? { ...f, isActive: true } : f))
		)
	}

	/**
	 * Deactivate a focusable element (make it ineligible for focus)
	 */
	deactivateFocusable(id: string): void {
		this.focusables.update((current) =>
			current.map((f) => (f.id === id ? { ...f, isActive: false } : f))
		)

		// If the deactivated element was focused, move to next
		if (this.activeFocusId() === id) {
			this.focusNext()
		}
	}

	/**
	 * Focus the next focusable element
	 */
	focusNext(): void {
		if (!this.isFocusEnabled()) return

		const focusableList = this.focusables()
		const activeFocusables = focusableList.filter((f) => f.isActive)
		if (activeFocusables.length === 0) return

		const currentId = this.activeFocusId()
		if (currentId === undefined) {
			// Focus first active element
			this.activeFocusId.set(activeFocusables[0]?.id)
			return
		}

		const currentIndex = activeFocusables.findIndex((f) => f.id === currentId)
		const nextIndex = (currentIndex + 1) % activeFocusables.length
		this.activeFocusId.set(activeFocusables[nextIndex]?.id)
	}

	/**
	 * Focus the previous focusable element
	 */
	focusPrevious(): void {
		if (!this.isFocusEnabled()) return

		const focusableList = this.focusables()
		const activeFocusables = focusableList.filter((f) => f.isActive)
		if (activeFocusables.length === 0) return

		const currentId = this.activeFocusId()
		if (currentId === undefined) {
			// Focus last active element
			this.activeFocusId.set(activeFocusables[activeFocusables.length - 1]?.id)
			return
		}

		const currentIndex = activeFocusables.findIndex((f) => f.id === currentId)
		const prevIndex =
			currentIndex <= 0 ? activeFocusables.length - 1 : currentIndex - 1
		this.activeFocusId.set(activeFocusables[prevIndex]?.id)
	}

	/**
	 * Focus a specific element by ID
	 */
	focus(id: string): void {
		if (!this.isFocusEnabled()) return

		const focusable = this.focusables().find((f) => f.id === id)
		if (focusable?.isActive) {
			this.activeFocusId.set(id)
		}
	}

	/**
	 * Enable focus management
	 */
	enableFocus(): void {
		this.isFocusEnabled.set(true)
	}

	/**
	 * Disable focus management
	 */
	disableFocus(): void {
		this.isFocusEnabled.set(false)
	}

	/**
	 * Check if a specific element is currently focused
	 */
	isFocused(id: string): boolean {
		return this.activeFocusId() === id
	}
}
//#endregion FocusService
