import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';
import { Bell, CheckCircle2, LoaderCircle, Mail, UserRound, X } from 'lucide-react';
import { useAuth } from '../auth/AuthContext';
import { getSettings, updateSettings } from '../services/settings';

const defaultSettings = {
  fullName: "",
  email: "",
  country: "",
  emailAlerts: true,
  weeklyDigest: true,
};

export function Settings() {
  const { user, userId } = useAuth();
  const [emailAlerts, setEmailAlerts] = useState(defaultSettings.emailAlerts);
  const [weeklyDigest, setWeeklyDigest] = useState(defaultSettings.weeklyDigest);
  const [fullName, setFullName] = useState(defaultSettings.fullName);
  const [email, setEmail] = useState(defaultSettings.email);
  const [country, setCountry] = useState(defaultSettings.country);
  const [initialState, setInitialState] = useState(defaultSettings);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isEmpty, setIsEmpty] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [queryError, setQueryError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  const hasChanges =
    emailAlerts !== initialState.emailAlerts ||
    weeklyDigest !== initialState.weeklyDigest ||
    fullName !== initialState.fullName ||
    country !== initialState.country;

  useEffect(() => {
    const userEmail = user?.email;

    if (!userId || !userEmail) {
      return;
    }

    const loadSettings = async () => {
      setIsLoading(true);
      setQueryError(null);

      try {
        const result = await getSettings(userId, userEmail);
        const settings = result.record;
        setIsEmpty(result.isEmpty);
        setInitialState(settings);
        setEmailAlerts(settings.emailAlerts);
        setWeeklyDigest(settings.weeklyDigest);
        setFullName(settings.fullName);
        setCountry(settings.country);
        setEmail(settings.email);
      } catch (error) {
        setQueryError(error instanceof Error ? error.message : 'Unable to load settings.');
      } finally {
        setIsLoading(false);
      }
    };

    void loadSettings();
  }, [user?.email, userId]);

  useEffect(() => {
    if (!showSuccessToast) {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => {
      setShowSuccessToast(false);
    }, 3000);

    return () => window.clearTimeout(timeoutId);
  }, [showSuccessToast]);

  const handleSaveChanges = async () => {
    if (!hasChanges || !userId) {
      return;
    }

    setIsSaving(true);
    setSaveError(null);

    try {
      const nextState = {
        fullName,
        email,
        country,
        emailAlerts,
        weeklyDigest,
      };

      await updateSettings(userId, nextState);
      setInitialState(nextState);
      setIsEmpty(false);
      setShowSuccessToast(true);
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : 'Unable to save settings.');
    } finally {
      setIsSaving(false);
    }
  };

  const renderToggle = ({
    label,
    description,
    enabled,
    onToggle,
    icon,
  }: {
    label: string;
    description: string;
    enabled: boolean;
    onToggle: () => void;
    icon: ReactNode;
  }) => (
    <div className="flex items-start gap-4 rounded-2xl border border-outline-variant bg-surface-variant/10 px-4 py-4 transition-colors hover:bg-surface-variant/20">
      <div className="mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold text-on-surface">{label}</p>
            <p className="mt-1 text-sm text-on-surface-variant">{description}</p>
          </div>
          <button
            type="button"
            aria-pressed={enabled}
            aria-label={`${enabled ? 'Disable' : 'Enable'} ${label}`}
            className={`relative inline-flex h-7 w-20 px-2 items-center rounded-full border transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ${
              enabled
                ? 'border-primary/20 bg-primary shadow-[0_0_0_4px_rgba(0,212,182,0.08)]'
                : 'border-outline-variant bg-outline-variant/80'
            }`}
            onClick={onToggle}
          >
            <span
              className={`inline-block h-5 w-5 rounded-full bg-white transition-transform duration-200 ${
                enabled ? 'translate-x-6 bg-black' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="relative h-full overflow-y-auto">
      {showSuccessToast ? (
        <div className="pointer-events-none sticky top-4 z-20 mx-auto mb-4 flex w-full max-w-7xl justify-end px-4 md:px-8">
          <div className="pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-2xl border border-emerald-500/30 bg-emerald-500/12 px-4 py-3 text-sm text-on-surface shadow-[0_18px_48px_rgba(0,0,0,0.28)] backdrop-blur">
            <CheckCircle2
              className="mt-0.5 shrink-0 text-emerald-400"
              size={18}
            />
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-on-surface">Settings saved</p>
              <p className="mt-1 text-on-surface-variant">
                Your account preferences were updated successfully.
              </p>
            </div>
            <button
              type="button"
              className="rounded-full p-1 text-on-surface-variant transition-colors hover:bg-white/5 hover:text-on-surface"
              onClick={() => setShowSuccessToast(false)}
              aria-label="Dismiss success message"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      ) : null}

      <div className="mx-auto max-w-7xl px-4 py-8 md:px-8">
        <header className="flex flex-col gap-4 border-b border-outline-variant pb-8 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-on-surface">Settings</h1>
            <p className="mt-2 max-w-2xl text-sm text-on-surface-variant">
              Control how allocation updates reach you and keep your account
              details current.
            </p>
          </div>
        </header>

        {queryError ? (
          <div className="mt-6 rounded-lg border border-error/20 bg-error/10 px-4 py-3 text-sm text-error">
            {queryError}
          </div>
        ) : null}

        {saveError ? (
          <div className="mt-6 rounded-lg border border-error/20 bg-error/10 px-4 py-3 text-sm text-error">
            {saveError}
          </div>
        ) : null}

        {!isLoading && isEmpty ? (
          <div className="mt-6 rounded-lg border border-outline-variant bg-surface-container px-4 py-3 text-sm text-on-surface-variant">
            No saved profile or notification preferences were found. Default
            settings are shown until you save.
          </div>
        ) : null}

        <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr] my-8">
          <section className="rounded-3xl border border-outline-variant bg-surface-container p-6 shadow-[0_20px_60px_rgba(0,0,0,0.18)]">
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-[0.7rem] font-bold uppercase tracking-[0.24em] text-on-surface-variant">
                  Notifications
                </h2>
                <p className="mt-2 text-sm text-on-surface-variant">
                  Choose which updates you want to receive from the tracker.
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Bell size={20} />
              </div>
            </div>

            {isLoading ? (
              <div className="text-sm text-on-surface-variant">
                Loading settings...
              </div>
            ) : (
              <div className="space-y-4">
                {renderToggle({
                  label: "Real-time Email Alerts",
                  description:
                    "Get immediate updates when allocations change or a teammate needs input.",
                  enabled: emailAlerts,
                  onToggle: () => setEmailAlerts(!emailAlerts),
                  icon: <Mail size={20} />,
                })}
                {renderToggle({
                  label: "Weekly LoE Digest",
                  description:
                    "Receive a weekly summary of logged effort, pending reviews, and project shifts.",
                  enabled: weeklyDigest,
                  onToggle: () => setWeeklyDigest(!weeklyDigest),
                  icon: <Bell size={20} />,
                })}
              </div>
            )}
          </section>

          <section className="rounded-3xl border border-outline-variant bg-surface-container p-6 shadow-[0_20px_60px_rgba(0,0,0,0.18)]">
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-[0.7rem] font-bold uppercase tracking-[0.24em] text-on-surface-variant">
                  Account
                </h2>
                <p className="mt-2 text-sm text-on-surface-variant">
                  Update profile details used across your workspace.
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <UserRound size={20} />
              </div>
            </div>

            {isLoading ? (
              <div className="text-sm text-on-surface-variant">
                Loading profile...
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                <div>
                  <label className="mb-2 block text-xs font-bold tracking-[0.18em] text-on-surface-variant">
                    FULL NAME
                  </label>
                  <input
                    type="text"
                    className="w-full rounded-2xl border border-outline-variant bg-surface-variant/10 px-4 py-3 text-sm text-on-surface outline-none transition-colors placeholder:text-on-surface-variant focus:border-primary"
                    value={fullName}
                    onChange={(event) => setFullName(event.target.value)}
                  />
                </div>
                <div>
                  <label className="mb-2 block text-xs font-bold tracking-[0.18em] text-on-surface-variant">
                    EMAIL ADDRESS
                  </label>
                  <input
                    type="email"
                    className="w-full rounded-2xl border border-outline-variant bg-surface-variant/5 px-4 py-3 text-sm text-on-surface-variant outline-none"
                    value={email}
                    disabled
                    readOnly
                  />
                </div>
                <div>
                  <label className="mb-2 block text-xs font-bold tracking-[0.18em] text-on-surface-variant">
                    COUNTRY
                  </label>
                  <select
                    className="w-full rounded-2xl border border-outline-variant bg-surface-variant/10 px-4 py-3 text-sm text-on-surface outline-none transition-colors focus:border-primary"
                    value={country}
                    onChange={(event) => setCountry(event.target.value)}
                  >
                    <option value="">Select country</option>
                    <option value="US">United States</option>
                    <option value="KE">Kenya</option>
                    <option value="PK">Pakistan</option>
                  </select>
                  <p className="mt-2 text-sm text-on-surface-variant">
                    National holidays for this country will be automatically
                    marked as time-off in your calendar and filled with 8 hours
                    of time-off logs.
                  </p>
                </div>
                <button
                  type="button"
                  className="rounded-2xl bg-secondary px-5 py-3 text-sm font-bold text-black transition-all hover:bg-secondary/90 disabled:cursor-not-allowed disabled:grayscale disabled:opacity-50"
                  disabled={!hasChanges || isSaving}
                  onClick={() => void handleSaveChanges()}
                >
                  {isSaving ? (
                    <span className="inline-flex items-center gap-2">
                      <LoaderCircle className="animate-spin" size={16} />
                      SAVING...
                    </span>
                  ) : (
                    "SAVE CHANGES"
                  )}
                </button>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
