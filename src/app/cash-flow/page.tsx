"use client";

import { AppShell } from "@/components/AppShell";
import { permissions } from "@/lib/permissions";

export default function CashFlowPage() {
  return (
    <AppShell title="Cash Flow" permission={permissions.cashFlowView}>
      <div className="card">Cash Flow module content.</div>
    </AppShell>
  );
}
