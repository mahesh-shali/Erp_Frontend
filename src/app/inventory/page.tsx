"use client";

import { AppShell } from "@/components/AppShell";
import { permissions } from "@/lib/permissions";

export default function InventoryPage() {
  return (
    <AppShell title="Inventory" permission={permissions.inventoryView}>
      <div className="card">Inventory module content.</div>
    </AppShell>
  );
}
