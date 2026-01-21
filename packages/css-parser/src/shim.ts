/**
 * SHIM: Patch for Tailwind CSS v4 "Invalid code point" crash.
 *
 * Tailwind v4's Rust bindings (via LightningCSS/Oxide) occasionally emit
 * the integer 16777215 (0xFFFFFF) as a value that eventually gets passed to
 * String.fromCodePoint(). This value is the maximum 24-bit unsigned integer,
 * likely used as a sentinel, but it exceeds the maximum valid Unicode code point
 * (0x10FFFF), causing a RangeError.
 *
 * This shim intercepts the crash and returns a replacement character instead.
 */

const originalFromCodePoint = String.fromCodePoint

// Only patch if we haven't already (in case of multiple imports)
if (!(originalFromCodePoint as any).__patched) {
	String.fromCodePoint = function (...codePoints: number[]): string {
		try {
			return originalFromCodePoint.apply(this, codePoints)
		} catch (e) {
			if (e instanceof RangeError) {
				// Check if the args contain the known invalid sentinel
				const invalid = codePoints.find((cp) => cp > 0x10ffff)
				if (invalid !== undefined) {
					if (process.env['DEBUG_WOLFIE_CSS']) {
						console.warn(
							`[wolfie-css] Shim: Bypassed invalid code point: ${invalid} (Tailwind v4 workaround)`
						)
					}
					// Return Replacement Character ()
					return '\uFFFD'
				}
			}
			throw e
		}
	}
	// Mark as patched
	;(String.fromCodePoint as any).__patched = true
}
