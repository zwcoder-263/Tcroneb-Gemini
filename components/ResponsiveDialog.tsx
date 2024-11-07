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
import { cn } from '@/utils'

type Props = {
  open: boolean
  onClose: () => void
  className?: string
  title: string | ReactNode
  description?: string | ReactNode
  trigger?: ReactNode
  children: ReactNode
  footer?: ReactNode
}

function DrawerDialog(props: Props) {
  const { open, onClose, className, title, description, trigger, children, footer } = props
  const isDesktop = useMediaQuery('(min-width: 450px)')

  const handleClose = (open: boolean) => {
    if (!open) onClose()
  }

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        {trigger ? <DialogTrigger asChild>{trigger}</DialogTrigger> : null}
        <DialogContent className={cn('overflow-y-auto landscape:max-md:h-4/5', className)}>
          <DialogHeader>
            {title ? <DialogTitle>{title}</DialogTitle> : null}
            {description ? <DialogDescription>{description}</DialogDescription> : null}
          </DialogHeader>
          <div>{children}</div>
          {footer ? <DialogFooter className="mx-auto w-4/5 flex-col sm:justify-center">{footer}</DialogFooter> : null}
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Drawer open={open} onOpenChange={handleClose}>
      {trigger ? <DrawerTrigger asChild>{trigger}</DrawerTrigger> : null}
      <DrawerContent className={className}>
        <DrawerHeader className="text-left">
          {title ? <DrawerTitle>{title}</DrawerTitle> : null}
          {description ? <DrawerDescription>{description}</DrawerDescription> : null}
        </DrawerHeader>
        <div className="h-full w-full overflow-hidden px-4">{children}</div>
        {footer ? <DrawerFooter className="pt-2">{footer}</DrawerFooter> : null}
      </DrawerContent>
    </Drawer>
  )
}

export default memo(DrawerDialog)
