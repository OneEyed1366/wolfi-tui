import { useContext } from 'react'
import { AppContext } from '../context/AppContext'

/**
`useApp` is a React hook that exposes a method to manually exit the app (unmount).
*/
export const useApp = () => useContext(AppContext)
