/**
 * Reactive focus state for Svelte 5.
 *
 * Must live in a .svelte.ts file so $state rune is available.
 * The WolfieSvelte class (index.ts) uses this to create a focus ID
 * that Svelte's $derived/$effect can track.
 */
export function createFocusState() {
	let activeFocusId = $state<string | undefined>(undefined)

	return {
		get: () => activeFocusId,
		set: (id: string | undefined) => {
			activeFocusId = id
		},
	}
}
