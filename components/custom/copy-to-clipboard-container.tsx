import { Check, Copy } from 'lucide-react'
import * as React from 'react'

import { Button } from '@/components/ui/button'

export default function CopyToClipboardContainer({
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  const [copied, setCopied] = React.useState(false)
  const ref = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    let timer: ReturnType<typeof setTimeout>
    if (copied) {
      timer = setTimeout(() => {
        setCopied(false)
      }, 2000)
    }
    return () => {
      clearTimeout(timer)
    }
  }, [copied])

  const onClick = () => {
    setCopied(true)
    const content = ref.current?.textContent
    if (content) {
      navigator.clipboard.writeText(content)
    }
  }

  return (
    <div className="group relative">
      <Button
        variant="outline"
        size="icon"
        className="absolute right-2 top-2 hidden size-6 group-hover:flex"
        onClick={onClick}
      >
        {!copied ? <Copy className="size-3" /> : <Check className="size-3" />}
      </Button>
      <div ref={ref} {...props}>
        {children}
      </div>
    </div>
  )
}
