"use client";

import { AppShell } from "@/components/AppShell";
import { permissions } from "@/lib/permissions";

export default function HumanResourcePage() {
  return (
    <AppShell title="Human Resource" permission={permissions.humanResourceView}>
      <div className="card">Human Resource module content.</div>
    </AppShell>
  );
}
