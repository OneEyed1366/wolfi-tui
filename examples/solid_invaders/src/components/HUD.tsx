import { createMemo } from 'solid-js'
import { Box, Text, Spacer, Show, Badge } from '@wolfie/solid'
import { BRAND } from '../theme'

//#region Props
type HUDProps = {
	score: number
	lives: number
	wave: number
	showFps?: boolean
	fps?: number
}
//#endregion Props

//#region Component
export default function HUD(props: HUDProps) {
	const formattedScore = createMemo(() =>
		props.score.toString().padStart(6, '0')
	)
	const livesHearts = createMemo(() =>
		Array.from({ length: props.lives }, () => '♥').join(' ')
	)

	return (
		<Box style={{ flexDirection: 'row', width: '100%' }}>
			<Box>
				<Text style={{ color: BRAND.primary }} className="font-bold">
					SCORE{' '}
				</Text>
				<Text
					style={{ color: BRAND.bgDark, backgroundColor: BRAND.primary }}
					className="font-bold"
				>
					{' ' + formattedScore() + ' '}
				</Text>
			</Box>

			<Spacer />

			<Box>
				<Text style={{ color: BRAND.error }} className="font-bold">
					LIVES{' '}
				</Text>
				<Text style={{ color: BRAND.error }}>{livesHearts()}</Text>
			</Box>

			<Spacer />

			<Box>
				<Text style={{ color: BRAND.primary }} className="font-bold">
					WAVE{' '}
				</Text>
				<Badge color={BRAND.primaryDark}>{props.wave.toString()}</Badge>
			</Box>

			<Show when={props.showFps}>
				<Spacer />
				<Box>
					<Text style={{ color: BRAND.textMuted }}>FPS </Text>
					<Text style={{ color: BRAND.success }}>{props.fps ?? 0}</Text>
				</Box>
			</Show>
		</Box>
	)
}
//#endregion Component
