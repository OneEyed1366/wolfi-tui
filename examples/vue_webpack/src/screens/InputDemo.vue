<template>
	<Box class="flex-col gap-1 w-full">
		<Text class="font-bold text-white">Text Inputs</Text>

		<!-- Text Input -->
		<Box class="flex-row">
			<Text class="w-[12]">Name: </Text>
			<TextInput
				placeholder="Enter your name..."
				:suggestions="nameSuggestions"
				:on-change="(v: string) => (name = v)"
				:on-submit="onNameSubmit"
			/>
		</Box>

		<!-- Password Input -->
		<Box class="flex-row">
			<Text class="w-[12]">Password: </Text>
			<PasswordInput :on-change="(v: string) => (password = v)" />
		</Box>

		<!-- Email Input -->
		<Box class="flex-row">
			<Text class="w-[12]">Email: </Text>
			<EmailInput :on-change="(v: string) => (email = v)" />
		</Box>

		<!-- Confirm Input -->
		<Box class="flex-row">
			<Text class="w-[12]">Confirm? </Text>
			<ConfirmInput :on-confirm="onConfirm" :on-cancel="onCancel" />
		</Box>

		<!-- Current Values -->
		<Box class="border-single border-gray p-1 mt-1 flex-col">
			<Text class="font-bold text-cyan">Current Values:</Text>
			<Text>Name: {{ name || '(empty)' }}</Text>
			<Text
				>Password:
				{{ password ? '*'.repeat(password.length) : '(empty)' }}</Text
			>
			<Text>Email: {{ email || '(empty)' }}</Text>
			<Text>Confirmed: {{ confirmStatus }}</Text>
		</Box>

		<Text class="text-gray">
			Type to enter values. Tab autocompletes suggestions.
		</Text>
	</Box>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import {
	Box,
	Text,
	TextInput,
	PasswordInput,
	EmailInput,
	ConfirmInput,
} from '@wolfie/vue'

const nameSuggestions = ['Alice', 'Bob', 'Charlie', 'Diana', 'Edward']

const name = ref('')
const password = ref('')
const email = ref('')
const confirmStatus = ref('pending')

const onNameSubmit = (value: string) => {
	name.value = value
}

const onConfirm = () => {
	confirmStatus.value = 'confirmed'
}

const onCancel = () => {
	confirmStatus.value = 'cancelled'
}
</script>
