import { unplugin, type Framework, type WolfieOptions } from './index'

export function wolfie(framework: Framework, options?: WolfieOptions) {
	return unplugin.webpack([framework, options])
}

export default wolfie
export { type Framework, type WolfieOptions }
