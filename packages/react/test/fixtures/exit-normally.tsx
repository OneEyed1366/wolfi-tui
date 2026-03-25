import React from 'react'
import { Text, render } from '@wolf-tui/react'

const { waitUntilExit } = render(<Text>Hello World</Text>)

await waitUntilExit()
console.log('exited')
