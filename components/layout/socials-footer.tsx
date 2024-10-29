import { Github, Globe, Twitter } from 'lucide-react'

import { ThemeToggle } from '@/components/theme/theme-toggle'
import { Button } from '@/components/ui/button'

import { Link } from '../custom/link'

export function SocialsFooter() {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-center gap-2 p-1">
        <ThemeToggle className="[&>svg]:size-4" />
        <Button variant="ghost" size="sm" className="w-9 px-0" asChild>
          <Link href="https://github.com/openstatusHQ/data-table-filters">
            <Github className="size-4" />
          </Link>
        </Button>
        <Button variant="ghost" size="sm" className="w-9 px-0" asChild>
          <Link href="https://twitter.com/openstatusHQ">
            <Twitter className="size-4" />
          </Link>
        </Button>
        <Button variant="ghost" size="sm" className="w-9 px-0" asChild>
          <Link href="https://openstatus.dev">
            <Globe className="size-4" />
          </Link>
        </Button>
      </div>
      <p className="text-center text-sm text-muted-foreground">
        Powered by <Link href="https://openstatus.dev">OpenStatus</Link>
      </p>
    </div>
  )
}
