import * as React from "react";

import { cn } from "./utils";

const Card = React.forwardRef(
  ({ className, ...props }, ref) => (
    <div
      data-slot="card"
      className={cn(
        "bg-card text-card-foreground flex flex-col gap-6 rounded-xl border",
        className,
      )}
      {...props}
      ref={ref}
    />
  ),
);
Card.displayName = "Card";

const CardHeader = React.forwardRef(
  ({ className, ...props }, ref) => (
    <div
      data-slot="card-header"
      className={cn(
        "@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 px-6 pt-6 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6",
        className,
      )}
      {...props}
      ref={ref}
    />
  ),
);
CardHeader.displayName = "CardHeader";

const CardTitle = React.forwardRef(
  ({ className, ...props }, ref) => (
    <h4
      data-slot="card-title"
      className={cn("leading-none", className)}
      {...props}
      ref={ref}
    />
  ),
);
CardTitle.displayName = "CardTitle";

const CardDescription = React.forwardRef(
  ({ className, ...props }, ref) => (
    <p
      data-slot="card-description"
      className={cn("text-muted-foreground", className)}
      {...props}
      ref={ref}
    />
  ),
);
CardDescription.displayName = "CardDescription";

const CardContent = React.forwardRef(
  ({ className, ...props }, ref) => (
    <div
      data-slot="card-content"
      className={cn("px-6 [&:last-child]:pb-6", className)}
      {...props}
      ref={ref}
    />
  ),
);
CardContent.displayName = "CardContent";

const CardFooter = React.forwardRef(
  ({ className, ...props }, ref) => (
    <div
      data-slot="card-footer"
      className={cn("flex items-center px-6 pb-6 [.border-t]:pt-6", className)}
      {...props}
      ref={ref}
    />
  ),
);
CardFooter.displayName = "CardFooter";

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
};
