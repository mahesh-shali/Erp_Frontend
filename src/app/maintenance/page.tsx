"use client";

import { AppShell } from "@/components/AppShell";
import { permissions } from "@/lib/permissions";

export default function MaintenancePage() {
  return (
    <AppShell title="Maintenance" permission={permissions.maintenanceView}>
      <div className="card">Maintenance module content.</div>
    </AppShell>
  );
}
