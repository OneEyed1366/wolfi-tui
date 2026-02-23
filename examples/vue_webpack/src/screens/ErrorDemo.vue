<template>
	<Box class="flex-col gap-1 w-full">
		<Text class="font-bold text-white">Error Overview</Text>
		<Text class="text-gray mb-1">
			Displays errors with stack traces for debugging
		</Text>

		<ErrorOverview :error="sampleError" />

		<Text class="text-gray mt-1">
			ErrorOverview automatically formats stack traces and highlights relevant
			information for easier debugging.
		</Text>
	</Box>
</template>

<script setup lang="ts">
import { Box, Text, ErrorOverview } from '@wolfie/vue'

const sampleError = new Error('Failed to fetch user data from API')
sampleError.stack = `Error: Failed to fetch user data from API
    at fetchUser (src/api/users.ts:42:15)
    at async loadUserProfile (src/components/Profile.vue:28:20)
    at async setup (src/components/Profile.vue:15:5)
    at callWithErrorHandling (node_modules/vue/dist/vue.js:1234:19)
    at setupComponent (node_modules/vue/dist/vue.js:5678:36)`
</script>
