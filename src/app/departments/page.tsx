"use client";

import { FormEvent, useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { apiFetch, getSession, hasPermission } from "@/lib/auth";
import { permissions } from "@/lib/permissions";

type Department = {
  id: string;
  code: string;
  name: string;
};

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [error, setError] = useState("");
  const canManage = hasPermission(getSession(), permissions.departmentsManage);

  async function load() {
    setDepartments(await apiFetch<Department[]>("/api/departments"));
  }

  useEffect(() => {
    load().catch((err) => setError(err instanceof Error ? err.message : "Could not load departments."));
  }, []);

  async function create(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    await apiFetch("/api/departments", {
      method: "POST",
      body: JSON.stringify({
        code: form.get("code"),
        name: form.get("name"),
      }),
    });
    event.currentTarget.reset();
    await load();
  }

  return (
    <AppShell title="Departments" permission={permissions.departmentsView}>
      {canManage && (
        <form className="toolbar" onSubmit={create}>
          <input name="code" placeholder="Code" required />
          <input name="name" placeholder="Department name" required />
          <button className="button" type="submit">
            Add
          </button>
        </form>
      )}
      {error && <p className="error">{error}</p>}
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Code</th>
              <th>Name</th>
            </tr>
          </thead>
          <tbody>
            {departments.map((department) => (
              <tr key={department.id}>
                <td>{department.code}</td>
                <td>{department.name}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {departments.length === 0 && <div className="empty">No departments yet.</div>}
      </div>
    </AppShell>
  );
}
