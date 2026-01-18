import React from 'react'
import { Text, render } from '@wolfie/react'

const { waitUntilExit } = render(<Text>Hello World</Text>)

await waitUntilExit()
console.log('exited')
