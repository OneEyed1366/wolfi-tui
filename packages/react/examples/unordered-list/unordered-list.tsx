import { render, Box, Text, UnorderedList } from '../../src/index.js'

function UnorderedListDemo() {
	return (
		<Box flexDirection="column" gap={1}>
			<Text bold>Unordered List Example</Text>

			{/* Simple unordered list */}
			<Box flexDirection="column">
				<Text dimColor>Simple list:</Text>
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
			<Box flexDirection="column">
				<Text dimColor>Nested list (different markers per depth):</Text>
				<UnorderedList>
					<UnorderedList.Item>
						<Box flexDirection="column">
							<Text>Fruits</Text>
							<UnorderedList>
								<UnorderedList.Item>
									<Box flexDirection="column">
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
									<Box flexDirection="column">
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
						<Box flexDirection="column">
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
			<Box flexDirection="column">
				<Text dimColor>Features:</Text>
				<UnorderedList>
					<UnorderedList.Item>
						<Text>
							<Text color="cyan">Automatic markers</Text> - Different bullet
							styles for each nesting level
						</Text>
					</UnorderedList.Item>
					<UnorderedList.Item>
						<Text>
							<Text color="cyan">Themeable</Text> - Customize markers and colors
							via theme
						</Text>
					</UnorderedList.Item>
					<UnorderedList.Item>
						<Text>
							<Text color="cyan">Flexible content</Text> - Items can contain any
							React nodes
						</Text>
					</UnorderedList.Item>
				</UnorderedList>
			</Box>
		</Box>
	)
}

render(<UnorderedListDemo />)
