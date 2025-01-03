'use client'
import { useLayoutEffect } from 'react'
import { useServerValueStore } from '@/store/setting'

interface Props {
  children: React.ReactNode
}

function StoreProvider({ children }: Props) {
  useLayoutEffect(() => {
    const { update } = useServerValueStore.getState()
    fetch('/api/env')
      .then(async (response) => {
        const env = await response.json()
        update(env)
      })
      .catch(console.error)
  }, [])

  return children
}

export default StoreProvider
