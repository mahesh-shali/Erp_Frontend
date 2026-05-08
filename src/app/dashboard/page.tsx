"use client";

import { AppShell } from "@/components/AppShell";
import { permissions } from "@/lib/permissions";

export default function DashboardPage() {
  return (
    <AppShell title="Dashboard" permission={permissions.dashboardView}>
      <section className="grid">
        <div className="card">
          <span>Operational status</span>
          <strong>Active</strong>
        </div>
        <div className="card">
          <span>Access model</span>
          <strong>RBAC</strong>
        </div>
        <div className="card">
          <span>Internal API</span>
          <strong>gRPC</strong>
        </div>
      </section>
    </AppShell>
  );
}
