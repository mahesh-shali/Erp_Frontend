"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { apiFetch } from "@/lib/auth";
import { permissions } from "@/lib/permissions";

type Role = {
  id: number;
  name: string;
  description: string;
  createdDate: string;
  modifiedDate?: string;
  permissions: string[];
};

export default function RolesPage() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    apiFetch<Role[]>("/api/roles")
      .then(setRoles)
      .catch((err) => setError(err instanceof Error ? err.message : "Could not load roles."));
  }, []);

  return (
    <AppShell title="Roles" permission={permissions.rolesView}>
      {error && <p className="error">{error}</p>}
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Role</th>
              <th>Description</th>
              <th>Permissions</th>
            </tr>
          </thead>
          <tbody>
            {roles.map((role) => (
              <tr key={role.id}>
                <td>{role.name}</td>
                <td>{role.description}</td>
                <td>{role.permissions.join(", ")}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {roles.length === 0 && <div className="empty">No roles visible.</div>}
      </div>
    </AppShell>
  );
}
