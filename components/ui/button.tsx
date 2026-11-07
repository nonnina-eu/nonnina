import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-sm font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-ink text-white hover:-translate-y-px hover:bg-black",
        outline:
          "border-[1.5px] border-ink bg-white text-ink hover:bg-mist",
        secondary: "bg-camomilla text-ink hover:bg-sole/60",
        sole: "bg-sole text-ink hover:brightness-95",
        ghost: "text-foreground hover:bg-muted",
        destructive: "bg-allarme text-white hover:bg-allarme-deep",
        link: "text-link underline-offset-4 hover:underline",
      },
      size: {
        default: "h-11 px-6 text-sm [&_svg]:size-4",
        sm: "h-9 px-4 text-sm [&_svg]:size-4",
        lg: "h-14 px-8 text-base [&_svg]:size-5",
        icon: "h-11 w-11 [&_svg]:size-5",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
