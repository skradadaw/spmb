"use client";

import { useState } from "react";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminHeader from "@/components/admin/AdminHeader";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="admin-scope flex min-h-screen bg-[#F6F7F5] text-[#101820]">
      <AdminSidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

      <div className="min-w-0 flex-1">
        <AdminHeader setMobileOpen={setMobileOpen} />
        <main className="mx-auto w-full max-w-[1280px] p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
