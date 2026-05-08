import { AuthForm } from "@/components/AuthForm";

export default function RegisterPage() {
  return (
    <div className="auth-page">
      <section className="auth-visual">
        <div>
          <h1>Create your ERP account</h1>
          <p>New users start with employee permissions and can be promoted by an administrator.</p>
        </div>
        <p>Keep registration separate from login so access flows stay easy to audit.</p>
      </section>
      <section className="auth-panel">
        <h2>Register</h2>
        <p>Create a user profile for ERP access.</p>
        <AuthForm mode="register" />
      </section>
    </div>
  );
}
