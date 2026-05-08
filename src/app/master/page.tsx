"use client";

import { AppShell } from "@/components/AppShell";
import { permissions } from "@/lib/permissions";

export default function MasterPage() {
  return (
    <AppShell title="Master" permission={permissions.masterView}>
      <div className="card">Master module content.</div>
    </AppShell>
  );
}
