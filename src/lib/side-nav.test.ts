import { describe, expect, it } from "vitest";
import { findActiveBranchIds, hasVisibleAccess, isActivePath, type SideNavItem } from "./side-nav";

const tree: SideNavItem[] = [
  {
    id: 1,
    name: "Sales",
    slug: "sales",
    path: "/sales",
    permission: "sales.view",
    level: 1,
    displayOrder: 1,
    canRead: true,
    canWrite: false,
    canUpdate: false,
    canDelete: false,
    isVisible: true,
    children: [
      {
        id: 2,
        parentId: 1,
        name: "Sales Setup",
        slug: "sales-setup",
        path: "/sales/setup",
        permission: "sales.setup.view",
        level: 2,
        displayOrder: 1,
        canRead: true,
        canWrite: false,
        canUpdate: false,
        canDelete: false,
        isVisible: true,
        children: [
          {
            id: 3,
            parentId: 2,
            name: "Dummy List",
            slug: "sales-setup-list",
            path: "/sales/setup/list",
            permission: "sales.setup.list.view",
            level: 3,
            displayOrder: 1,
            canRead: true,
            canWrite: false,
            canUpdate: false,
            canDelete: false,
            isVisible: true,
            children: [],
          },
        ],
      },
    ],
  },
];

describe("side nav utilities", () => {
  it("detects active nested paths", () => {
    expect(isActivePath(tree[0], "/sales/setup/list")).toBe(true);
    expect(isActivePath(tree[0].children[0].children[0], "/sales/setup/list")).toBe(true);
  });

  it("returns the active branch ids for nested nav", () => {
    expect(findActiveBranchIds(tree, "/sales/setup/list")).toEqual([1, 2, 3]);
  });

  it("requires visibility and at least one action flag", () => {
    expect(hasVisibleAccess({ isVisible: true, canRead: true, canWrite: false, canUpdate: false, canDelete: false })).toBe(true);
    expect(hasVisibleAccess({ isVisible: false, canRead: true, canWrite: true, canUpdate: true, canDelete: true })).toBe(false);
    expect(hasVisibleAccess({ isVisible: true, canRead: false, canWrite: false, canUpdate: false, canDelete: false })).toBe(false);
  });
});
