import { AuthForm } from "@/components/AuthForm";

export default function LoginPage() {
  return (
    <div className="auth-page">
      <section className="auth-visual">
        <div>
          <h1>ERP Suite</h1>
          <p>Run operations with role-based access, audited permissions, and clean handoffs between teams.</p>
        </div>
        <p>Default admin after migration seed: admin@erp.local / Admin@12345</p>
      </section>
      <section className="auth-panel">
        <h2>Login</h2>
        <p>Use your ERP account to continue.</p>
        <AuthForm mode="login" />
      </section>
    </div>
  );
}
