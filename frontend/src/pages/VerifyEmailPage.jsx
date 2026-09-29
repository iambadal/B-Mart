import { useEffect, useState } from "react";
import { Link, useLocation, useParams } from "react-router";
import { resendVerification, verifyEmail } from "../api/AuthAPI";

export default function VerifyEmailPage() {
  const { token } = useParams();
  const { state } = useLocation();
  const [email, setEmail] = useState(state?.email || "");
  const [message, setMessage] = useState(token ? "Verifying your email…" : state?.notice || "Check your inbox for a verification link.");
  const [busy, setBusy] = useState(Boolean(token));

  useEffect(() => {
    if (!token) return;
    let active = true;
    verifyEmail(token).then((result) => {
      if (active) setMessage(result.message);
    }).finally(() => {
      if (active) setBusy(false);
    });
    return () => { active = false; };
  }, [token]);

  const resend = async (event) => {
    event.preventDefault();
    setBusy(true);
    const result = await resendVerification(email);
    setMessage(result.message);
    setBusy(false);
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-100 p-4 font-poppins">
      <section className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg">
        <h1 className="mb-3 text-2xl font-semibold text-gray-800">Verify your email</h1>
        <p className="mb-6 text-gray-600">{message}</p>
        {!token && (
          <form onSubmit={resend} className="space-y-4">
            <label className="block text-sm text-gray-700" htmlFor="verification-email">Email address</label>
            <input id="verification-email" type="email" required value={email} onChange={(event) => setEmail(event.target.value)} className="w-full rounded-md border border-gray-300 px-3 py-2" />
            <button disabled={busy} className="w-full rounded-md bg-green-600 px-4 py-2 font-medium text-white disabled:opacity-60">{busy ? "Sending…" : "Send verification link"}</button>
          </form>
        )}
        <Link className="mt-6 inline-block text-sm text-blue-600 hover:underline" to="/login">Return to sign in</Link>
      </section>
    </main>
  );
}
