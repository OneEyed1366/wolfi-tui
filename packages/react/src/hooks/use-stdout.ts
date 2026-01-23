import { useContext } from 'react'
import { StdoutContext } from '../context/StdoutContext'

/**
`useStdout` is a React hook that exposes the stdout stream where Wolfie renders your app.
*/
export const useStdout = () => useContext(StdoutContext)
