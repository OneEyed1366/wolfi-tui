import widestLine from 'widest-line'
import { logger } from './logger'

const cache = new Map<string, Output>()

type Output = {
	width: number
	height: number
}

const measureText = (text: string): Output => {
	if (text.length === 0) {
		return {
			width: 0,
			height: 0,
		}
	}

	const cachedDimensions = cache.get(text)

	if (cachedDimensions) {
		if (logger.enabled) {
			logger.log({
				ts: performance.now(),
				cat: 'measure',
				op: 'measureText',
				textLen: text.length,
				width: cachedDimensions.width,
				height: cachedDimensions.height,
				cached: true,
			})
		}
		return cachedDimensions
	}

	const width = widestLine(text)
	const height = text.split('\n').length
	const dimensions = { width, height }
	if (logger.enabled) {
		logger.log({
			ts: performance.now(),
			cat: 'measure',
			op: 'measureText',
			textLen: text.length,
			width: dimensions.width,
			height: dimensions.height,
			cached: false,
		})
	}
	cache.set(text, dimensions)

	return dimensions
}

export default measureText
