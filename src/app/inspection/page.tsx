"use client";

import { AppShell } from "@/components/AppShell";
import { permissions } from "@/lib/permissions";

export default function InspectionPage() {
  return (
    <AppShell title="Inspection" permission={permissions.inspectionView}>
      <div className="card">Inspection module content.</div>
    </AppShell>
  );
}
