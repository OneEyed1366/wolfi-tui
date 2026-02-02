import { Box, Text, UnorderedList, Newline, useInput } from '@wolfie/react'
import type { Screen } from '../hooks/useInvaders'
import { BRAND } from '../theme'

//#region Types
type HelpProps = {
	onNavigate: (screen: Screen) => void
}
//#endregion Types

//#region Component
export function Help({ onNavigate }: HelpProps) {
	useInput((input, key) => {
		if (key.escape || input === 'q') {
			onNavigate('menu')
		}
	})

	return (
		<Box
			style={{
				width: '100vw',
				height: '100vh',
				flexDirection: 'column',
				alignItems: 'center',
				justifyContent: 'center',
				backgroundColor: BRAND.bgDark,
				padding: 2,
			}}
		>
			<Text style={{ color: BRAND.primary }} className="font-bold text-lg">
				📖 HELP
			</Text>
			<Newline />

			<Box style={{ flexDirection: 'row', gap: 4 }}>
				{/* Controls Column */}
				<Box style={{ flexDirection: 'column' }}>
					<Text className="text-yellow font-bold">Controls</Text>
					<UnorderedList>
						<UnorderedList.Item>
							<Text>
								<Text className="text-cyan">←/→</Text> Move ship
							</Text>
						</UnorderedList.Item>
						<UnorderedList.Item>
							<Text>
								<Text className="text-cyan">Space</Text> Fire
							</Text>
						</UnorderedList.Item>
						<UnorderedList.Item>
							<Text>
								<Text className="text-cyan">P</Text> Pause
							</Text>
						</UnorderedList.Item>
						<UnorderedList.Item>
							<Text>
								<Text className="text-cyan">Q/Esc</Text> Quit
							</Text>
						</UnorderedList.Item>
					</UnorderedList>
				</Box>

				{/* Scoring Column */}
				<Box style={{ flexDirection: 'column' }}>
					<Text className="text-yellow font-bold">Scoring</Text>
					<UnorderedList>
						<UnorderedList.Item>
							<Text>
								<Text className="text-red">^</Text> Top alien = 30 pts
							</Text>
						</UnorderedList.Item>
						<UnorderedList.Item>
							<Text>
								<Text className="text-yellow">N</Text> Mid alien = 20 pts
							</Text>
						</UnorderedList.Item>
						<UnorderedList.Item>
							<Text>
								<Text className="text-green">Y</Text> Bot alien = 10 pts
							</Text>
						</UnorderedList.Item>
						<UnorderedList.Item>
							<Text>Wave clear = +100 pts</Text>
						</UnorderedList.Item>
					</UnorderedList>
				</Box>
			</Box>

			<Newline />
			<Box style={{ flexDirection: 'column', alignItems: 'center' }}>
				<Text className="text-yellow font-bold">Tips</Text>
				<Text className="text-gray">
					• Destroy aliens before they reach bottom
				</Text>
				<Text className="text-gray">• Shields absorb bullets but degrade</Text>
				<Text className="text-gray">• Aliens speed up as you kill them</Text>
			</Box>

			<Newline />
			<Text className="text-gray">Esc Return to menu</Text>
		</Box>
	)
}
//#endregion Component
