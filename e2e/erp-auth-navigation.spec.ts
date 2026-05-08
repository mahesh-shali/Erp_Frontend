import { expect, test, type Page } from "@playwright/test";

const authResponse = {
  accessToken: "access-token",
  refreshToken: "refresh-token",
  expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
  displayName: "ERP Admin",
  email: "admin@erp.local",
  roles: ["SuperAdmin"],
  permissions: ["dashboard.view", "sales.view"],
};

const sideNav = [
  {
    id: 1,
    name: "Dashboard",
    slug: "dashboard",
    path: "/dashboard",
    permission: "dashboard.view",
    level: 1,
    displayOrder: 1,
    canRead: true,
    canWrite: true,
    canUpdate: true,
    canDelete: true,
    isVisible: true,
    children: [],
  },
  {
    id: 2,
    name: "Sales",
    slug: "sales",
    path: "/sales",
    permission: "sales.view",
    level: 1,
    displayOrder: 2,
    canRead: true,
    canWrite: true,
    canUpdate: true,
    canDelete: true,
    isVisible: true,
    children: [
      {
        id: 3,
        parentId: 2,
        name: "Sales Setup",
        slug: "sales-setup",
        path: "/sales/setup",
        permission: "sales.setup.view",
        level: 2,
        displayOrder: 1,
        canRead: true,
        canWrite: true,
        canUpdate: true,
        canDelete: true,
        isVisible: true,
        children: [
          {
            id: 4,
            parentId: 3,
            name: "Dummy List",
            slug: "sales-setup-list",
            path: "/sales/setup/list",
            permission: "sales.setup.list.view",
            level: 3,
            displayOrder: 1,
            canRead: true,
            canWrite: true,
            canUpdate: true,
            canDelete: true,
            isVisible: true,
            children: [],
          },
        ],
      },
    ],
  },
];

test.beforeEach(async ({ page }) => {
  await mockApi(page);
});

test("login stores session and opens dashboard", async ({ page, isMobile }) => {
  test.skip(isMobile, "desktop topbar assertion is covered separately from mobile sidebar behavior");
  await page.goto("/login");
  await page.getByLabel("Email").fill("admin@erp.local");
  await page.getByLabel("Password").fill("Admin@12345");
  await page.getByRole("button", { name: "Login" }).click();

  await expect(page).toHaveURL(/\/dashboard$/);
  await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();
  await expect(page.getByText("ERP Admin")).toBeVisible();
});

test("sidebar expands nested database nav and navigates to leaf page", async ({ page, isMobile }) => {
  test.skip(isMobile, "desktop expanded sidebar behavior is covered separately from mobile collapsed behavior");
  await loginByStorage(page);
  await page.goto("/dashboard");

  await page.getByRole("button", { name: "Sales" }).click();
  await page.getByRole("button", { name: "Sales Setup" }).click();
  await page.getByRole("link", { name: "Dummy List" }).click();

  await expect(page).toHaveURL(/\/sales\/setup\/list$/);
  await expect(page.getByRole("heading", { name: "Sales / Setup / List" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Dummy List" })).toHaveClass(/active/);
});

test("mobile hides desktop topbar and uses collapsed sidebar toggle", async ({ page, isMobile }) => {
  test.skip(!isMobile, "mobile-only behavior");
  await loginByStorage(page);
  await page.goto("/dashboard");

  await expect(page.getByText("ERP Portal")).toBeHidden();
  await page.getByRole("button").first().click();
  await expect(page.getByRole("link", { name: "Dashboard" })).toBeVisible();
});

async function mockApi(page: Page) {
  await page.route("https://localhost:5250/api/auth/login", async (route) => {
    await route.fulfill({ json: authResponse });
  });
  await page.route("https://localhost:5250/api/navigation/side-nav", async (route) => {
    await route.fulfill({ json: sideNav });
  });
  await page.route("https://localhost:5250/api/auth/logout", async (route) => {
    await route.fulfill({ status: 204 });
  });
}

async function loginByStorage(page: Page) {
  await page.goto("/login");
  await page.evaluate((session) => {
    window.sessionStorage.setItem("erp.session", JSON.stringify({ ...session, lastActivityAt: Date.now() }));
  }, authResponse);
}
