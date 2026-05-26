import { initials } from "../../utils/format";

type AvatarProps = {
  name: string;
  src?: string;
  size?: "sm" | "md" | "lg";
};

const sizes = {
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-14 w-14 text-lg",
};

export function Avatar({ name, src, size = "md" }: AvatarProps) {
  if (src) {
    return <img src={src} alt={name} className={`${sizes[size]} rounded-full object-cover ring-2 ring-white/70`} />;
  }

  return (
    <span
      className={`${sizes[size]} grid shrink-0 place-items-center rounded-full bg-slate-950 font-semibold text-white shadow-sm dark:bg-white dark:text-slate-950`}
    >
      {initials(name)}
    </span>
  );
}
