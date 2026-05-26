import type { ReactNode } from "react";
import clsx from "clsx";

type PanelProps = {
  children: ReactNode;
  className?: string;
};

export function Panel({ children, className }: PanelProps) {
  return (
    <section
      className={clsx(
        "rounded-xl border border-slate-200 bg-white/82 p-5 shadow-sm backdrop-blur dark:border-white/10 dark:bg-white/[0.06]",
        className,
      )}
    >
      {children}
    </section>
  );
}
