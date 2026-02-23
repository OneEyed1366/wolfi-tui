import { Box, Text } from '@wolfie/react'
import { BRAND } from '../theme'

//#region Constants
const MIN_CONTROLS_WIDTH = 25
//#endregion Constants

//#region Component
export function Controls() {
	return (
		<Box style={{ flexDirection: 'column', minWidth: MIN_CONTROLS_WIDTH }}>
			<Text style={{ color: BRAND.primary }} className="font-bold">
				🎮 Controls
			</Text>
			<Text>
				<Text style={{ color: BRAND.primary }}>←/→</Text>
				<Text style={{ color: BRAND.textMuted }}>{'\u00A0'}Move </Text>
				<Text style={{ color: BRAND.primary }}>Space</Text>
				<Text style={{ color: BRAND.textMuted }}>{'\u00A0'}Shoot</Text>
			</Text>
			<Text>
				<Text style={{ color: BRAND.primary }}>P</Text>
				<Text style={{ color: BRAND.textMuted }}>{'\u00A0'}Pause </Text>
				<Text style={{ color: BRAND.primary }}>Q</Text>
				<Text style={{ color: BRAND.textMuted }}>{'\u00A0'}Quit</Text>
			</Text>
		</Box>
	)
}
//#endregion Component
