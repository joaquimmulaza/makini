import * as React from "react"
import { cva } from "class-variance-authority"
import { cn } from "../../lib/utils.js"

const badgeVariants = cva(
    "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
    {
        variants: {
            variant: {
                default:
                    "border-transparent bg-makini-green text-white hover:bg-makini-green/80",
                secondary:
                    "border-transparent bg-makini-earth text-white hover:bg-makini-earth/80",
                destructive:
                    "border-transparent bg-red-500 text-white hover:bg-red-500/80",
                outline: "text-makini-black border-makini-clay",
                success: "border-transparent bg-makini-lightGreen text-makini-green",
            },
        },
        defaultVariants: {
            variant: "default",
        },
    }
)

function Badge({ className, variant, ...props }) {
    return (
        <div className={cn(badgeVariants({ variant }), className)} {...props} />
    )
}

export { Badge, badgeVariants }
