import render from '../../src/render'
import { Box, Text, OrderedList } from '../../src/index'

function OrderedListDemo() {
	return (
		<Box style={{ flexDirection: 'column', gap: 1 }}>
			<Text style={{ fontWeight: 'bold' }}>Ordered List Example</Text>

			{/* Simple ordered list */}
			<Box style={{ flexDirection: 'column' }}>
				<Text style={{ color: 'gray' }}>Simple list:</Text>
				<OrderedList>
					<OrderedList.Item>
						<Text>First item</Text>
					</OrderedList.Item>
					<OrderedList.Item>
						<Text>Second item</Text>
					</OrderedList.Item>
					<OrderedList.Item>
						<Text>Third item</Text>
					</OrderedList.Item>
				</OrderedList>
			</Box>

			{/* Nested ordered list */}
			<Box style={{ flexDirection: 'column' }}>
				<Text style={{ color: 'gray' }}>Nested list:</Text>
				<OrderedList>
					<OrderedList.Item>
						<Text>Introduction</Text>
					</OrderedList.Item>
					<OrderedList.Item>
						<Box style={{ flexDirection: 'column' }}>
							<Text>Getting Started</Text>
							<OrderedList>
								<OrderedList.Item>
									<Text>Installation</Text>
								</OrderedList.Item>
								<OrderedList.Item>
									<Text>Configuration</Text>
								</OrderedList.Item>
								<OrderedList.Item>
									<Box style={{ flexDirection: 'column' }}>
										<Text>Advanced Setup</Text>
										<OrderedList>
											<OrderedList.Item>
												<Text>Environment variables</Text>
											</OrderedList.Item>
											<OrderedList.Item>
												<Text>Custom themes</Text>
											</OrderedList.Item>
										</OrderedList>
									</Box>
								</OrderedList.Item>
							</OrderedList>
						</Box>
					</OrderedList.Item>
					<OrderedList.Item>
						<Text>Usage</Text>
					</OrderedList.Item>
					<OrderedList.Item>
						<Text>API Reference</Text>
					</OrderedList.Item>
				</OrderedList>
			</Box>

			{/* Many items (demonstrates padding alignment) */}
			<Box style={{ flexDirection: 'column' }}>
				<Text style={{ color: 'gray' }}>Many items (number alignment):</Text>
				<OrderedList>
					<OrderedList.Item>
						<Text>Item one</Text>
					</OrderedList.Item>
					<OrderedList.Item>
						<Text>Item two</Text>
					</OrderedList.Item>
					<OrderedList.Item>
						<Text>Item three</Text>
					</OrderedList.Item>
					<OrderedList.Item>
						<Text>Item four</Text>
					</OrderedList.Item>
					<OrderedList.Item>
						<Text>Item five</Text>
					</OrderedList.Item>
					<OrderedList.Item>
						<Text>Item six</Text>
					</OrderedList.Item>
					<OrderedList.Item>
						<Text>Item seven</Text>
					</OrderedList.Item>
					<OrderedList.Item>
						<Text>Item eight</Text>
					</OrderedList.Item>
					<OrderedList.Item>
						<Text>Item nine</Text>
					</OrderedList.Item>
					<OrderedList.Item>
						<Text>Item ten</Text>
					</OrderedList.Item>
					<OrderedList.Item>
						<Text>Item eleven</Text>
					</OrderedList.Item>
					<OrderedList.Item>
						<Text>Item twelve</Text>
					</OrderedList.Item>
				</OrderedList>
			</Box>
		</Box>
	)
}

render(<OrderedListDemo />)
