// Store all instances of Wolfie (instance) to ensure that consecutive render() calls
// use the same instance of Wolfie and don't create a new one
//
// This map has to be stored in a separate file, because render creates instances,
// but instance should delete itself from the map on unmount

import type WolfieReact from './wolfie_react'

const instances = new WeakMap<NodeJS.WriteStream, WolfieReact>()
export default instances
