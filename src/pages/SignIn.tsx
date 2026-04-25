import type { FormEvent } from 'react';
import { useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { KeyRound, LoaderCircle, LogIn } from 'lucide-react';
import { useAuth } from '../auth/AuthContext';

const demoAccounts = [
  {
    label: 'Rachel',
    email: 'rachel.kenyani@pixeledge.io',
    password: 'Rachel@254',
  },
  {
    label: 'David',
    email: 'david.mutiso@pixeledge.io',
    password: 'David@254',
  },
] as const;

const defaultDemoAccount = demoAccounts[0];

type LocationState = {
  from?: {
    pathname?: string;
  };
};

export function SignIn() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isLoading, session, signIn } = useAuth();

  const [email, setEmail] = useState<string>(defaultDemoAccount.email);
  const [password, setPassword] = useState<string>(defaultDemoAccount.password);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const state = location.state as LocationState | null;
  const redirectTo = state?.from?.pathname || '/';

  if (!isLoading && session) {
    return <Navigate to={redirectTo} replace />;
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      await signIn(email.trim(), password);
      navigate(redirectTo, { replace: true });
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Unable to sign in.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(0,212,182,0.16),_transparent_32%),linear-gradient(180deg,_#101114_0%,_#090a0f_100%)] px-6 py-12">
      <div className="w-full max-w-md rounded-[28px] border border-outline-variant bg-surface-container/95 p-8 shadow-[0_28px_90px_rgba(0,0,0,0.35)] backdrop-blur">
        <div className="mb-8">
          <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/12 text-primary">
            <KeyRound size={20} />
          </div>
          <h1 className="text-3xl font-bold text-on-surface">Sign in</h1>
          <p className="mt-2 text-sm text-on-surface-variant">
            Use your Supabase auth account to access the tracker.
          </p>
        </div>

        <div className="mb-6 rounded-2xl border border-primary/20 bg-primary/10 px-4 py-4">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">Test Credentials</p>
          <div className="mt-3 space-y-3">
            {demoAccounts.map((account) => (
              <button
                key={account.email}
                type="button"
                className="flex w-full items-start justify-between rounded-xl border border-outline-variant bg-surface-container/40 px-3 py-3 text-left transition-colors hover:bg-surface-variant/20"
                onClick={() => {
                  setEmail(account.email);
                  setPassword(account.password);
                  setErrorMessage(null);
                }}
              >
                <div>
                  <p className="text-sm font-semibold text-on-surface">{account.label}</p>
                  <p className="mt-1 text-sm text-on-surface">
                    <span className="font-semibold">Email:</span> {account.email}
                  </p>
                  <p className="mt-1 text-sm text-on-surface">
                    <span className="font-semibold">Password:</span> {account.password}
                  </p>
                </div>
                <span className="text-xs font-bold tracking-[0.18em] text-primary">USE</span>
              </button>
            ))}
          </div>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="mb-2 block text-xs font-bold tracking-[0.18em] text-on-surface-variant">EMAIL</label>
            <input
              type="email"
              autoComplete="email"
              className="w-full rounded-2xl border border-outline-variant bg-surface-variant/10 px-4 py-3 text-sm text-on-surface outline-none transition-colors focus:border-primary"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-xs font-bold tracking-[0.18em] text-on-surface-variant">PASSWORD</label>
            <input
              type="password"
              autoComplete="current-password"
              className="w-full rounded-2xl border border-outline-variant bg-surface-variant/10 px-4 py-3 text-sm text-on-surface outline-none transition-colors focus:border-primary"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </div>

          {errorMessage ? (
            <div className="rounded-2xl border border-error/20 bg-error/10 px-4 py-3 text-sm text-error">
              {errorMessage}
            </div>
          ) : null}

          <button
            type="submit"
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-secondary px-5 py-3 text-sm font-bold text-black transition-all hover:bg-secondary/90 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isSubmitting}
          >
            {isSubmitting ? <LoaderCircle className="animate-spin" size={18} /> : <LogIn size={18} />}
            {isSubmitting ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  );
}
