import { useContext } from 'react'
import { StdinContext } from '../context/StdinContext'

/**
`useStdin` is a React hook that exposes the stdin stream.
*/
export const useStdin = () => useContext(StdinContext)
