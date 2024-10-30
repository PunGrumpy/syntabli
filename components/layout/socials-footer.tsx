import { GithubIcon, Globe02Icon, InstagramIcon } from 'hugeicons-react'

import { ThemeToggle } from '@/components/theme/theme-toggle'
import { Button } from '@/components/ui/button'

import { Link } from '../custom/link'

export function SocialsFooter() {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-center gap-2 p-1">
        <ThemeToggle className="[&>svg]:size-4" />
        <Button variant="ghost" size="sm" className="w-9 px-0" asChild>
          <Link href="https://github.com/PunGrumpy/syntabli">
            <GithubIcon className="size-4" />
          </Link>
        </Button>
        <Button variant="ghost" size="sm" className="w-9 px-0" asChild>
          <Link href="https://instagram.com/pungrumpy_p">
            <InstagramIcon className="size-4" />
          </Link>
        </Button>
        <Button variant="ghost" size="sm" className="w-9 px-0" asChild>
          <Link href="https://pungrumpy.com">
            <Globe02Icon className="size-4" />
          </Link>
        </Button>
      </div>
      <p className="text-center text-sm text-muted-foreground">
        Powered by <Link href="https://pungrumpy.com">PunGrumpy</Link>
      </p>
    </div>
  )
}
