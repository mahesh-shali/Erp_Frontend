"use client";

import { AppShell } from "@/components/AppShell";
import { permissions } from "@/lib/permissions";

export default function SalesPage() {
  return (
    <AppShell title="Sales" permission={permissions.salesView}>
      <div className="card">Sales module content.</div>
    </AppShell>
  );
}
