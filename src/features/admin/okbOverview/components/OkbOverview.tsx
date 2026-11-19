import type { OkbOverviewView } from '../okbOverview';
import { OkbGuideCard } from './OkbGuideCard';
import { OkbPipeline } from './OkbPipeline';
import { OkbResultsCard } from './OkbResultsCard';
import { OkbScheduleExplorer } from './OkbScheduleExplorer';

/**
 * Tab Ringkasan OKB: tahap Pendaftar lebih dulu, lalu Jadwal OKB yang bisa dijelajahi per tanggal,
 * lalu Hasil OKB per Gelombang dan alur kegiatannya. roomNames: daftar Ruang OKB di Pengaturan, null bila gagal dimuat.
 */
export function OkbOverview({ overview, roomNames }: { overview: OkbOverviewView; roomNames: string[] | null }) {
  return (
    <div className="space-y-6">
      <OkbPipeline pipeline={overview.pipeline} />
      <OkbScheduleExplorer days={overview.days} roomNames={roomNames} />
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        <OkbResultsCard results={overview.results} />
        <OkbGuideCard />
      </div>
    </div>
  );
}
