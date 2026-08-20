import type { ReactNode } from "react";
import { badgeClasses } from "@/lib/styles";

export function Badge({
  tone = "neutral",
  children,
}: {
  tone?: "neutral" | "accent";
  children: ReactNode;
}) {
  return <span className={badgeClasses(tone)}>{children}</span>;
}
