/**
 * Inlined constants from react-reconciler/constants
 *
 * These are stable numeric values from React's reconciler.
 * We inline them to avoid Node.js ESM/CJS resolution issues
 * with react-reconciler which only provides CommonJS exports.
 *
 * @see https://github.com/facebook/react/blob/main/packages/react-reconciler/src/ReactRootTags.js
 * @see https://github.com/facebook/react/blob/main/packages/react-reconciler/src/ReactEventPriorities.js
 */

// Root tags
export const LegacyRoot = 0
export const ConcurrentRoot = 1

// Event priorities
export const NoEventPriority = 0
export const DiscreteEventPriority = 2
export const ContinuousEventPriority = 8
export const DefaultEventPriority = 32
export const IdleEventPriority = 268435456
