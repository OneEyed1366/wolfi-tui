// Store all instances of Ink (instance) to ensure that consecutive render() calls
// use the same instance of Ink and don't create a new one
//
// This map has to be stored in a separate file, because render creates instances,
// but instance should delete itself from the map on unmount

import type Ink from './ink'

const instances = new WeakMap<NodeJS.WriteStream, Ink>()
export default instances
