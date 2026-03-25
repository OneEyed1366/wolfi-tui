<script>
	import { Box, Text, OrderedList, OrderedListItem, UnorderedList, UnorderedListItem } from '@wolfie/svelte'
</script>

<Box className="flex-col gap-1 w-full">
	<!-- Ordered List -->
	<Text className="font-bold text-[#ffffff]">Ordered List</Text>
	<OrderedList>
		<OrderedListItem><Text>Install dependencies with pnpm</Text></OrderedListItem>
		<OrderedListItem><Text>Configure your environment</Text></OrderedListItem>
		<OrderedListItem><Text>Run the development server</Text></OrderedListItem>
		<OrderedListItem><Text>Build for production</Text></OrderedListItem>
	</OrderedList>

	<!-- Unordered List -->
	<Text className="font-bold mt-1 text-[#ffffff]">Unordered List</Text>
	<UnorderedList>
		<UnorderedListItem><Text>Supports Svelte 5 runes</Text></UnorderedListItem>
		<UnorderedListItem><Text>Full TypeScript support</Text></UnorderedListItem>
		<UnorderedListItem><Text>CSS preprocessing (SCSS, LESS, Stylus)</Text></UnorderedListItem>
		<UnorderedListItem><Text>Tailwind CSS integration</Text></UnorderedListItem>
	</UnorderedList>

	<!-- Nested Lists -->
	<Text className="font-bold mt-1 text-[#ffffff]">Nested Lists</Text>
	<OrderedList>
		<OrderedListItem><Text>Frontend</Text></OrderedListItem>
		<UnorderedList>
			<UnorderedListItem><Text>Svelte components</Text></UnorderedListItem>
			<UnorderedListItem><Text>Composables</Text></UnorderedListItem>
		</UnorderedList>
		<OrderedListItem><Text>Backend</Text></OrderedListItem>
		<UnorderedList>
			<UnorderedListItem><Text>API routes</Text></UnorderedListItem>
			<UnorderedListItem><Text>Database models</Text></UnorderedListItem>
		</UnorderedList>
	</OrderedList>
</Box>
