export type DistributionItem = {
  label: string;
  count: number;
  percentage: number;
};

export type RecentApplicant = {
  id: string;
  namaLengkap: string;
  pilihanKelas: string;
  jenisPendaftaran: string;
  status: string;
  createdAt: string;
};

export type AdminDashboardSummary = {
  totalRegistrations: number;
  awaitingVerification: number;
  completedRegistrations: number;
  incompleteUploads: number;
  classDistribution: DistributionItem[];
  typeDistribution: DistributionItem[];
  recentApplicants: RecentApplicant[];
  updatedAt: string;
};
