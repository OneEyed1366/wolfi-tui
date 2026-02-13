import { defineComponent } from 'vue'
import { Box } from './Box'

/**
 * A flexible space that expands along the major axis of its containing layout.
 *
 * It's useful as a shortcut for filling all the available space between elements.
 */
export const Spacer = defineComponent({
	name: 'Spacer',
	setup() {
		return () => {
			return <Box style={{ flexGrow: 1 }} />
		}
	},
})
