import type { ReactNode } from "react";
import { badgeClasses, type BadgeTone } from "@/lib/styles";

export function Badge({
  tone = "neutral",
  children,
}: {
  tone?: BadgeTone;
  children: ReactNode;
}) {
  return <span className={badgeClasses(tone)}>{children}</span>;
}
