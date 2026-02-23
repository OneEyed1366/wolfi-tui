<template>
	<Box class="flex-col gap-1 w-full">
		<!-- Alerts -->
		<Text class="font-bold text-white">Alerts</Text>
		<Alert type="success">Operation completed successfully!</Alert>
		<Alert type="warning">Check your settings before proceeding</Alert>
		<Alert type="error">Something went wrong</Alert>

		<!-- Badges -->
		<Text class="font-bold text-white mt-1">Badges</Text>
		<Box class="flex-row gap-2">
			<Badge color="green">Active</Badge>
			<Badge color="yellow">Pending</Badge>
			<Badge color="red">Failed</Badge>
			<Badge color="blue">Info</Badge>
		</Box>

		<!-- Status Messages -->
		<Text class="font-bold text-white mt-1">Status Messages</Text>
		<StatusMessage type="success">Build succeeded</StatusMessage>
		<StatusMessage type="error">Tests failed (3 errors)</StatusMessage>
		<StatusMessage type="warning">Dependencies outdated</StatusMessage>
		<StatusMessage type="info">Compiling...</StatusMessage>

		<!-- Spinner -->
		<Text class="font-bold text-white mt-1">Spinner</Text>
		<Box class="flex-row gap-1">
			<Spinner />
			<Text class="text-gray">Loading resources...</Text>
		</Box>

		<!-- Progress Bar -->
		<Text class="font-bold text-white mt-1">Progress Bar</Text>
		<Box class="flex-col w-[40]">
			<ProgressBar :value="75" />
			<Text class="text-gray">75% complete</Text>
		</Box>
	</Box>
</template>

<script setup lang="ts">
import {
	Box,
	Text,
	Alert,
	Badge,
	StatusMessage,
	Spinner,
	ProgressBar,
} from '@wolfie/vue'
</script>
