<script lang="ts">
  import { Box, Text, useInput, useApp } from '@wolfie/svelte'

  const { exit } = useApp()

  let count = $state(0)

  useInput((input, key) => {
    if (input === 'q') exit()
    if (key.upArrow) count++
    if (key.downArrow) count--
  })
</script>

<Box style={{ flexDirection: 'column', padding: 1, borderStyle: 'round', borderColor: 'blue' }}>
  <Box style={{ marginBottom: 1 }}>
    <Text style={{ color: 'blue', fontWeight: 'bold' }}>Svelte Counter</Text>
  </Box>

  <Box style={{ marginBottom: 1 }}>
    <Text>Counter: </Text>
    <Text style={{ color: 'red', fontWeight: 'bold' }}>{count}</Text>
  </Box>

  <Box>
    <Text style={{ color: 'gray' }}>↑/↓ change · q quit</Text>
  </Box>
</Box>
