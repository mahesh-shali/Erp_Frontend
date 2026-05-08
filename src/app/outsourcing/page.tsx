"use client";

import { AppShell } from "@/components/AppShell";
import { permissions } from "@/lib/permissions";

export default function OutsourcingPage() {
  return (
    <AppShell title="Outsourcing" permission={permissions.outsourcingView}>
      <div className="card">Outsourcing module content.</div>
    </AppShell>
  );
}
