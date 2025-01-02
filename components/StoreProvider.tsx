'use client'
import { useLayoutEffect } from 'react'
import { useServerValueStore } from '@/store/setting'

interface Props {
  children: React.ReactNode
  isProtected?: boolean
  modelList?: string
  uploadLimit?: number
  buildMode?: string
}

function StoreProvider(props: Props) {
  const { children, ...serverValues } = props

  useLayoutEffect(() => {
    const { update } = useServerValueStore.getState()
    update(serverValues)
  }, [serverValues])

  return children
}

export default StoreProvider
