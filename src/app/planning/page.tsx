"use client";

import { AppShell } from "@/components/AppShell";
import { permissions } from "@/lib/permissions";

export default function PlanningPage() {
  return (
    <AppShell title="Planning" permission={permissions.planningView}>
      <div className="card">Planning module content.</div>
    </AppShell>
  );
}
