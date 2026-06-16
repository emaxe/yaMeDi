import { ReactNode } from 'react'

import { cn } from '../../lib/utils'

interface MobileChartContainerProps {
  children: ReactNode
  className?: string
}

export function MobileChartContainer({ children, className }: MobileChartContainerProps) {
  return <div className={cn('h-64 md:h-80 w-full', className)}>{children}</div>
}
