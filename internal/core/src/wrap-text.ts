import wrapAnsi from 'wrap-ansi'
import cliTruncate from 'cli-truncate'
import { type IStyles } from './styles'
import { logger } from './logger'

const cache: Record<string, string> = {}

const wrapText = (
	text: string,
	maxWidth: number,
	wrapType: IStyles['textWrap']
): string => {
	const cacheKey = text + String(maxWidth) + String(wrapType)
	const cachedText = cache[cacheKey]

	if (cachedText) {
		if (logger.enabled) {
			logger.log({
				ts: performance.now(),
				cat: 'measure',
				op: 'wrapText',
				textLen: text.length,
				maxWidth,
				wrapType: String(wrapType),
				cached: true,
			})
		}
		return cachedText
	}

	let wrappedText = text

	if (wrapType === 'wrap') {
		wrappedText = wrapAnsi(text, maxWidth, {
			trim: false,
			hard: true,
		})
	}

	if (wrapType!.startsWith('truncate')) {
		let position: 'end' | 'middle' | 'start' = 'end'

		if (wrapType === 'truncate-middle') {
			position = 'middle'
		}

		if (wrapType === 'truncate-start') {
			position = 'start'
		}

		wrappedText = cliTruncate(text, maxWidth, { position })
	}

	if (logger.enabled) {
		logger.log({
			ts: performance.now(),
			cat: 'measure',
			op: 'wrapText',
			textLen: text.length,
			maxWidth,
			wrapType: String(wrapType),
			cached: false,
		})
	}
	cache[cacheKey] = wrappedText

	return wrappedText
}

export default wrapText
