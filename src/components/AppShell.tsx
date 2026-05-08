"use client";

import { Building2, ChevronRight, CircleDollarSign, ClipboardCheck, Factory, Handshake, LayoutDashboard, LogOut, Menu, Package, PanelLeftClose, Shield, UserRoundCog, Users, Wrench } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ReactNode, useEffect, useState } from "react";
import { apiFetch, getSession, hasPermission, logout as logoutSession, touchSession, type AuthSession } from "@/lib/auth";
import { permissions } from "@/lib/permissions";
import { findActiveBranchIds, isActivePath, type SideNavItem } from "@/lib/side-nav";

const sideNavCacheKey = "erp.sideNav";

const icons = {
  dashboard: LayoutDashboard,
  master: Building2,
  sales: CircleDollarSign,
  outsourcing: Handshake,
  production: Factory,
  inventory: Package,
  planning: ClipboardCheck,
  "cash-flow": CircleDollarSign,
  inspection: ClipboardCheck,
  maintenance: Wrench,
  "human-resource": UserRoundCog,
  users: Users,
  roles: Shield,
};

type Props = {
  title: string;
  permission: string;
  children: ReactNode;
};

export function AppShell({ title, permission, children }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const [session, setSession] = useState<AuthSession | null>(null);
  const [navItems, setNavItems] = useState<SideNavItem[]>([]);
  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    async function loadSession() {
      const current = getSession();
      if (!current) {
        router.replace("/login");
        return;
      }

      setSession(current);
      setAllowed(hasPermission(current, permission));

      const cachedNav = window.sessionStorage.getItem(sideNavCacheKey);
      if (cachedNav) {
        setNavItems(JSON.parse(cachedNav) as SideNavItem[]);
      }

      apiFetch<SideNavItem[]>("/api/navigation/side-nav")
        .then((items) => {
          window.sessionStorage.setItem(sideNavCacheKey, JSON.stringify(items));
          setNavItems(items);
        })
        .catch(() => setNavItems([]));
    }

    function onActivity() {
      touchSession();
    }

    void loadSession();
    const interval = window.setInterval(loadSession, 15_000);
    const events = ["click", "keydown", "mousemove", "scroll", "touchstart"];
    events.forEach((event) => window.addEventListener(event, onActivity, { passive: true }));

    return () => {
      window.clearInterval(interval);
      events.forEach((event) => window.removeEventListener(event, onActivity));
    };
  }, [permission, router]);

  useEffect(() => {
    const activeIds = findActiveBranchIds(navItems, pathname);
    if (activeIds.length === 0) {
      return;
    }

    setExpandedIds((current) => {
      const next = new Set(current);
      activeIds.forEach((id) => next.add(id));
      return next;
    });
  }, [navItems, pathname]);

  async function logout() {
    await logoutSession();
    router.replace("/login");
  }

  function toggleExpanded(id: number) {
    setExpandedIds((current) => {
      const next = new Set(current);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  function renderNavItems(items: SideNavItem[]) {
    return items.map((item) => {
      const hasChildren = item.children.length > 0;
      const expanded = expandedIds.has(item.id);
      const active = isActivePath(item, pathname);
      const Icon = icons[item.slug as keyof typeof icons] ?? Building2;

      return (
        <div className="nav-group" key={item.id}>
          {hasChildren ? (
            <button
              className={`nav-item nav-level-${item.level}${active ? " active" : ""}`}
              onClick={() => toggleExpanded(item.id)}
              type="button"
            >
              {item.level === 1 && <Icon size={18} />}
              {item.level > 1 && <span className="nav-dot" />}
              <span>{item.name}</span>
              <ChevronRight className={expanded ? "chevron expanded" : "chevron"} size={16} />
            </button>
          ) : (
            <Link
              className={`nav-item nav-level-${item.level}${active ? " active" : ""}`}
              href={item.path}
              onClick={() => setMobileSidebarOpen(false)}
            >
              {item.level === 1 && <Icon size={18} />}
              {item.level > 1 && <span className="nav-dot" />}
              <span>{item.name}</span>
            </Link>
          )}
          {hasChildren && expanded && <div className="nav-children">{renderNavItems(item.children)}</div>}
        </div>
      );
    });
  }

  if (!session) {
    return null;
  }

  return (
    <div className={mobileSidebarOpen ? "app-layout sidebar-open" : "app-layout"}>
      <button
        className="mobile-sidebar-toggle"
        onClick={() => setMobileSidebarOpen((current) => !current)}
        type="button"
      >
        {mobileSidebarOpen ? <PanelLeftClose size={20} /> : <Menu size={20} />}
      </button>
      <aside className={mobileSidebarOpen ? "sidebar open" : "sidebar"}>
        <div className="brand">
          <Building2 size={24} />
          ERP Suite
        </div>
        <nav className="nav">
          {renderNavItems(navItems)}
          <button onClick={logout} type="button">
            <LogOut size={18} />
            Logout
          </button>
        </nav>
      </aside>
      <main className="content">
        <header className="desktop-topbar">
          <div>
            <span>ERP Portal</span>
            <strong>{title}</strong>
          </div>
          <div className="topbar-actions">
            <span className="user-chip">{session.displayName}</span>
            <button className="topbar-logout" onClick={logout} type="button">
              <LogOut size={16} />
              Logout
            </button>
          </div>
        </header>
        <div className="topbar">
          <h1>{title}</h1>
        </div>
        {allowed ? children : <div className="card">You do not have permission to view this page.</div>}
      </main>
    </div>
  );
}
