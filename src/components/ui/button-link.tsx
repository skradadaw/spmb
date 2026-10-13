import * as React from "react"
import Link from "next/link"
import type { VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"
import { buttonVariants } from "./button"

type ButtonLinkProps = React.ComponentProps<typeof Link> & VariantProps<typeof buttonVariants>

/** Navigation styled as a button; keeps link semantics instead of Base UI's button role. */
function ButtonLink({ className, variant, size, ...props }: ButtonLinkProps) {
  return <Link data-slot="button" className={cn(buttonVariants({ variant, size, className }))} {...props} />
}

export { ButtonLink }
