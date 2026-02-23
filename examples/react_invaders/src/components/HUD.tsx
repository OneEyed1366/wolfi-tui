import { Box, Text, Spacer } from '@wolfie/react'
import { BRAND } from '../theme'

//#region Types
type HUDProps = {
	score: number
	lives: number
	wave: number
	showFps?: boolean
	fps?: number
}
//#endregion Types

//#region Component
export function HUD({
	score,
	lives,
	wave,
	showFps = false,
	fps = 0,
}: HUDProps) {
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
					{' '}
					{score.toString().padStart(6, '0')}{' '}
				</Text>
			</Box>

			<Spacer />

			<Box>
				<Text style={{ color: BRAND.error }} className="font-bold">
					LIVES{' '}
				</Text>
				<Text style={{ color: BRAND.error }}>
					{Array.from({ length: lives }, () => '♥').join(' ')}
				</Text>
			</Box>

			<Spacer />

			<Box>
				<Text style={{ color: BRAND.primary }} className="font-bold">
					WAVE{' '}
				</Text>
				<Text
					style={{ color: BRAND.bgDark, backgroundColor: BRAND.primaryDark }}
					className="font-bold"
				>
					{' '}
					{wave}{' '}
				</Text>
			</Box>

			{showFps && (
				<>
					<Spacer />
					<Box>
						<Text style={{ color: BRAND.textMuted }}>FPS </Text>
						<Text style={{ color: BRAND.success }}>{fps}</Text>
					</Box>
				</>
			)}
		</Box>
	)
}
//#endregion Component
