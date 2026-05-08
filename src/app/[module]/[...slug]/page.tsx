import { permissions } from "@/lib/permissions";
import { NestedModuleClient } from "./NestedModuleClient";

const modulePermissions: Record<string, { title: string; permission: string }> = {
  sales: { title: "Sales", permission: permissions.salesView },
  outsourcing: { title: "Outsourcing", permission: permissions.outsourcingView },
  production: { title: "Production", permission: permissions.productionView },
  inventory: { title: "Inventory", permission: permissions.inventoryView },
  planning: { title: "Planning", permission: permissions.planningView },
  "cash-flow": { title: "Cash Flow", permission: permissions.cashFlowView },
  inspection: { title: "Inspection", permission: permissions.inspectionView },
  maintenance: { title: "Maintenance", permission: permissions.maintenanceView },
  "human-resource": { title: "Human Resource", permission: permissions.humanResourceView },
};

type Props = {
  params: Promise<{
    module: string;
    slug: string[];
  }>;
};

export default async function NestedModulePage({ params }: Props) {
  const resolved = await params;
  const module = modulePermissions[resolved.module] ?? {
    title: "ERP",
    permission: permissions.dashboardView,
  };
  const pageTitle = `${module.title} / ${resolved.slug.map(formatSegment).join(" / ")}`;

  return <NestedModuleClient title={pageTitle} permission={module.permission} />;
}

function formatSegment(segment: string) {
  return segment
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}
