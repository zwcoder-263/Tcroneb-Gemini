'use client'
import { memo, type ReactNode } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer'
import useMediaQuery from '@/hooks/useMediaQuery'

type Props = {
  open: boolean
  onClose: () => void
  title: string
  description?: string
  trigger?: ReactNode
  children: ReactNode
  footer?: ReactNode
}

function DrawerDialog({ open, onClose, title, description, trigger, children, footer }: Props) {
  const isDesktop = useMediaQuery('(min-width: 450px)')

  const handleClose = (open: boolean) => {
    if (!open) onClose()
  }

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        {trigger ? <DialogTrigger asChild>{trigger}</DialogTrigger> : null}
        <DialogContent className="overflow-y-auto landscape:max-md:h-4/5">
          <DialogHeader>
            {title ? <DialogTitle>{title}</DialogTitle> : null}
            {description ? <DialogDescription>{description}</DialogDescription> : null}
          </DialogHeader>
          {children}
          <DialogFooter className="mx-auto w-4/5 flex-col sm:justify-center">{footer}</DialogFooter>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Drawer open={open} onOpenChange={handleClose}>
      {trigger ? <DrawerTrigger asChild>{trigger}</DrawerTrigger> : null}
      <DrawerContent>
        <DrawerHeader className="text-left">
          {title ? <DrawerTitle>{title}</DrawerTitle> : null}
          {description ? <DrawerDescription>{description}</DrawerDescription> : null}
        </DrawerHeader>
        <div className="px-4">{children}</div>
        <DrawerFooter className="pt-2">{footer}</DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}

export default memo(DrawerDialog)
