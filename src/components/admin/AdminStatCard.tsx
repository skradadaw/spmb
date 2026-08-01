import type { AdminIconName } from "./AdminIcon";
import AdminIcon from "./AdminIcon";
import { adminCardCls } from "./styles";

type AdminStatCardTone = "neutral" | "warning" | "success";

const toneClasses: Record<AdminStatCardTone, { icon: string; helper: string }> = {
  neutral: {
    icon: "bg-[#E9F8EB] text-[#00880F]",
    helper: "text-[#667085]",
  },
  warning: {
    icon: "bg-amber-50 text-amber-700",
    helper: "text-amber-700",
  },
  success: {
    icon: "bg-green-50 text-[#00880F]",
    helper: "text-[#00880F]",
  },
};

export function AdminStatCard({
  label,
  value,
  helper,
  icon,
  tone,
}: {
  label: string;
  value: number;
  helper: string;
  icon: AdminIconName;
  tone: AdminStatCardTone;
}) {
  const styles = toneClasses[tone];

  return (
    <section className={`${adminCardCls} p-5`}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-[#667085]">{label}</p>
          <p className="mt-2 text-3xl font-bold tracking-tight text-[#101820]">{value}</p>
        </div>
        <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${styles.icon}`}>
          <AdminIcon name={icon} className="h-5 w-5" />
        </span>
      </div>
      <p className={`mt-4 text-sm font-medium ${styles.helper}`}>{helper}</p>
    </section>
  );
}
