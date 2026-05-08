"use client";

import { AppShell } from "@/components/AppShell";

type Props = {
  title: string;
  permission: string;
};

export function NestedModuleClient({ title, permission }: Props) {
  return (
    <AppShell title={title} permission={permission}>
      <div className="card">{title} content.</div>
    </AppShell>
  );
}
