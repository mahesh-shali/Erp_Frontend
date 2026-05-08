export type SideNavItem = {
  id: number;
  parentId?: number;
  name: string;
  slug: string;
  path: string;
  permission: string;
  level: number;
  displayOrder: number;
  canRead: boolean;
  canWrite: boolean;
  canUpdate: boolean;
  canDelete: boolean;
  isVisible: boolean;
  children: SideNavItem[];
};

export function findActiveBranchIds(items: SideNavItem[], pathname: string): number[] {
  for (const item of items) {
    const childBranch = findActiveBranchIds(item.children, pathname);
    if (childBranch.length > 0) {
      return [item.id, ...childBranch];
    }

    if (isActivePath(item, pathname)) {
      return [item.id];
    }
  }

  return [];
}

export function isActivePath(item: Pick<SideNavItem, "path">, pathname: string) {
  return pathname === item.path || (item.path !== "/" && pathname.startsWith(`${item.path}/`));
}

export function hasVisibleAccess(item: Pick<SideNavItem, "isVisible" | "canRead" | "canWrite" | "canUpdate" | "canDelete">) {
  return item.isVisible && (item.canRead || item.canWrite || item.canUpdate || item.canDelete);
}
