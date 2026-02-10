type SchedulerOptions = {
	/** Bypass async batching — call renderFn synchronously on every scheduleRender() */
	sync?: boolean
	/** Custom microtask scheduler (e.g. Angular NgZone.runOutsideAngular) */
	queueFn?: (callback: () => void) => void
}

export function createRenderScheduler(
	renderFn: () => void,
	options?: SchedulerOptions
) {
	if (options?.sync) {
		// debug: true / screenReader mode — synchronous, no batching
		return { scheduleRender: renderFn, flush: renderFn }
	}

	let isDirty = false
	let isScheduled = false
	const queue = options?.queueFn ?? queueMicrotask

	const _flush = () => {
		if (!isDirty) {
			isScheduled = false
			return
		}
		// Reset isDirty BEFORE calling renderFn, but keep isScheduled = true
		// to prevent re-entrant scheduling during renderFn execution.
		isDirty = false
		renderFn()
		// After renderFn completes: check if re-entrant mutations occurred
		if (isDirty) {
			queue(_flush)
		} else {
			isScheduled = false
		}
	}

	const scheduleRender = () => {
		isDirty = true
		if (!isScheduled) {
			isScheduled = true
			queue(_flush)
		}
	}

	/** Force immediate render (resize, mount). Cancels pending scheduled flush. */
	const flush = () => {
		isDirty = false
		isScheduled = false
		renderFn()
	}

	return { scheduleRender, flush }
}
