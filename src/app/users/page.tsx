"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { apiFetch } from "@/lib/auth";
import { permissions } from "@/lib/permissions";

type User = {
  id: string;
  name: string;
  email: string;
  roleId: number;
  role: string;
};

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    apiFetch<User[]>("/api/users")
      .then(setUsers)
      .catch((err) => setError(err instanceof Error ? err.message : "Could not load users."));
  }, []);

  return (
    <AppShell title="Users" permission={permissions.usersView}>
      {error && <p className="error">{error}</p>}
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Roles</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>{user.role}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {users.length === 0 && <div className="empty">No users visible.</div>}
      </div>
    </AppShell>
  );
}
