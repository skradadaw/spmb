export type AdminIconName =
  | "dashboard" | "users" | "content" | "logout" | "menu" | "close"
  | "download" | "arrow-right" | "search" | "file"
  | "student" | "check" | "clock" | "warning" | "plus" | "trash";

const paths: Record<AdminIconName, string> = {
  dashboard: "M4 4h6v6H4z M14 4h6v6h-6z M4 14h6v6H4z M14 14h6v6h-6z",
  users: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2 M9 13a4 4 0 1 0 0-8 4 4 0 0 0 0 8 M22 21v-2a4 4 0 0 0-3-3.87 M16 5.13a4 4 0 0 1 0 7.75",
  content: "M4 4h16v16H4z M8 8h8 M8 12h8 M8 16h5",
  logout: "M10 17l5-5-5-5 M15 12H3 M21 19V5a2 2 0 0 0-2-2h-6",
  menu: "M4 7h16 M4 12h16 M4 17h16",
  close: "M18 6 6 18 M6 6l12 12",
  download: "M12 3v12 M7 10l5 5 5-5 M4 21h16",
  "arrow-right": "M5 12h14 M14 7l5 5-5 5",
  search: "M21 21l-4.35-4.35 M19 11a8 8 0 1 1-16 0 8 8 0 0 1 16 0",
  file: "M6 2h8l4 4v16H6z M14 2v6h6",
  student: "M3 9l9-5 9 5-9 5z M7 12v4c3 2 7 2 10 0v-4 M21 10v6",
  check: "M20 6 9 17l-5-5",
  clock: "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20 M12 6v6l4 2",
  warning: "M12 3 2 21h20z M12 9v4 M12 17h.01",
  plus: "M12 5v14 M5 12h14",
  trash: "M3 6h18 M8 6V4h8v2 M19 6l-1 15H6L5 6 M10 11v5 M14 11v5",
};

export default function AdminIcon({
  name,
  className = "h-5 w-5",
  decorative = true,
}: {
  name: AdminIconName;
  className?: string;
  decorative?: boolean;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden={decorative}
      aria-label={decorative ? undefined : name}
      role={decorative ? undefined : "img"}
    >
      <path d={paths[name]} />
    </svg>
  );
}
