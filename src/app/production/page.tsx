"use client";

import { AppShell } from "@/components/AppShell";
import { permissions } from "@/lib/permissions";

export default function ProductionPage() {
  return (
    <AppShell title="Production" permission={permissions.productionView}>
      <div className="card">Production module content.</div>
    </AppShell>
  );
}
