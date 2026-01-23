import { useContext } from 'react'
import { StderrContext } from '../context/StderrContext'

/**
`useStderr` is a React hook that exposes the stderr stream.
*/
export const useStderr = () => useContext(StderrContext)
