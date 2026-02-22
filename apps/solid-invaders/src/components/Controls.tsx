import { Box, Text } from '@wolfie/solid'
import { BRAND } from '../theme'

//#region Constants
const MIN_CONTROLS_WIDTH = 25
const NBSP = '\u00A0'
//#endregion Constants

//#region Component
export default function Controls() {
	return (
		<Box style={{ flexDirection: 'column', minWidth: MIN_CONTROLS_WIDTH }}>
			<Text style={{ color: BRAND.primary }} className="font-bold">
				🎮 Controls
			</Text>
			<Text>
				<Text style={{ color: BRAND.primary }}>←/→</Text>
				<Text style={{ color: BRAND.textMuted }}>{NBSP}Move </Text>
				<Text style={{ color: BRAND.primary }}>Space</Text>
				<Text style={{ color: BRAND.textMuted }}>{NBSP}Shoot</Text>
			</Text>
			<Text>
				<Text style={{ color: BRAND.primary }}>P</Text>
				<Text style={{ color: BRAND.textMuted }}>{NBSP}Pause </Text>
				<Text style={{ color: BRAND.primary }}>Q</Text>
				<Text style={{ color: BRAND.textMuted }}>{NBSP}Quit</Text>
			</Text>
		</Box>
	)
}
//#endregion Component
