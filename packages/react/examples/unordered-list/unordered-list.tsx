import render from '../../src/render'
import { Box, Text, UnorderedList } from '../../src/index'

function UnorderedListDemo() {
	return (
		<Box style={{ flexDirection: 'column', gap: 1 }}>
			<Text style={{ fontWeight: 'bold' }}>Unordered List Example</Text>

			{/* Simple unordered list */}
			<Box style={{ flexDirection: 'column' }}>
				<Text style={{ color: 'gray' }}>Simple list:</Text>
				<UnorderedList>
					<UnorderedList.Item>
						<Text>Apple</Text>
					</UnorderedList.Item>
					<UnorderedList.Item>
						<Text>Banana</Text>
					</UnorderedList.Item>
					<UnorderedList.Item>
						<Text>Cherry</Text>
					</UnorderedList.Item>
				</UnorderedList>
			</Box>

			{/* Nested unordered list (different markers at each depth) */}
			<Box style={{ flexDirection: 'column' }}>
				<Text style={{ color: 'gray' }}>Nested list (different markers per depth):</Text>
				<UnorderedList>
					<UnorderedList.Item>
						<Box style={{ flexDirection: 'column' }}>
							<Text>Fruits</Text>
							<UnorderedList>
								<UnorderedList.Item>
									<Box style={{ flexDirection: 'column' }}>
										<Text>Citrus</Text>
										<UnorderedList>
											<UnorderedList.Item>
												<Text>Orange</Text>
											</UnorderedList.Item>
											<UnorderedList.Item>
												<Text>Lemon</Text>
											</UnorderedList.Item>
											<UnorderedList.Item>
												<Text>Grapefruit</Text>
											</UnorderedList.Item>
										</UnorderedList>
									</Box>
								</UnorderedList.Item>
								<UnorderedList.Item>
									<Box style={{ flexDirection: 'column' }}>
										<Text>Berries</Text>
										<UnorderedList>
											<UnorderedList.Item>
												<Text>Strawberry</Text>
											</UnorderedList.Item>
											<UnorderedList.Item>
												<Text>Blueberry</Text>
											</UnorderedList.Item>
										</UnorderedList>
									</Box>
								</UnorderedList.Item>
							</UnorderedList>
						</Box>
					</UnorderedList.Item>
					<UnorderedList.Item>
						<Box style={{ flexDirection: 'column' }}>
							<Text>Vegetables</Text>
							<UnorderedList>
								<UnorderedList.Item>
									<Text>Carrot</Text>
								</UnorderedList.Item>
								<UnorderedList.Item>
									<Text>Broccoli</Text>
								</UnorderedList.Item>
								<UnorderedList.Item>
									<Text>Spinach</Text>
								</UnorderedList.Item>
							</UnorderedList>
						</Box>
					</UnorderedList.Item>
				</UnorderedList>
			</Box>

			{/* Features list */}
			<Box style={{ flexDirection: 'column' }}>
				<Text style={{ color: 'gray' }}>Features:</Text>
				<UnorderedList>
					<UnorderedList.Item>
						<Text>
							<Text style={{ color: 'cyan' }}>Automatic markers</Text> - Different bullet
							styles for each nesting level
						</Text>
					</UnorderedList.Item>
					<UnorderedList.Item>
						<Text>
							<Text style={{ color: 'cyan' }}>Themeable</Text> - Customize markers and colors
							via theme
						</Text>
					</UnorderedList.Item>
					<UnorderedList.Item>
						<Text>
							<Text style={{ color: 'cyan' }}>Flexible content</Text> - Items can contain any
							React nodes
						</Text>
					</UnorderedList.Item>
				</UnorderedList>
			</Box>
		</Box>
	)
}

render(<UnorderedListDemo />)
