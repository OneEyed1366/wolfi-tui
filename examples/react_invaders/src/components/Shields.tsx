import { Box, Text, ProgressBar } from '@wolfie/react'
import { SHIELD_DAMAGE_SPRITES } from '../constants'
import type { Shield as ShieldType } from '../hooks/useInvaders'

//#region Types
type ShieldsProps = {
	shields: ShieldType[]
	showHealthBars?: boolean
}
//#endregion Types

//#region Shield Health Calculation
function calculateShieldHealth(shield: ShieldType): number {
	const totalHealth = shield.cells.reduce((sum, cell) => sum + cell.health, 0)
	const maxHealth = shield.cells.length * 4
	return (totalHealth / maxHealth) * 100
}
//#endregion Shield Health Calculation

//#region Component
export function Shields({ shields, showHealthBars = false }: ShieldsProps) {
	return (
		<>
			{shields.map((shield, shieldIndex) => (
				<Box key={`shield-${shieldIndex}`}>
					{shield.cells.map((cell, cellIndex) => {
						if (cell.health <= 0) return null

						const sprite =
							SHIELD_DAMAGE_SPRITES[4 - cell.health] ?? SHIELD_DAMAGE_SPRITES[0]

						return (
							<Box
								key={`cell-${shieldIndex}-${cellIndex}`}
								style={{
									position: 'absolute',
									left: cell.x,
									top: cell.y,
								}}
							>
								<Text className="text-shield">{sprite}</Text>
							</Box>
						)
					})}

					{showHealthBars && (
						<Box
							style={{
								position: 'absolute',
								left: shield.x,
								top: shield.y + 4,
								width: 5,
							}}
						>
							<ProgressBar value={calculateShieldHealth(shield)} />
						</Box>
					)}
				</Box>
			))}
		</>
	)
}
//#endregion Component
