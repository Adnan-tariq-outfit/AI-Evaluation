'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { useAuth } from '../../hooks/useAuth';
import { AuthService } from '../../services/auth.service';
import type { User } from '../../types/auth.types';
import { useI18n } from '../../components/I18nProvider';

export default function ProfilePage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const { t } = useI18n();
  const [serverUser, setServerUser] = useState<User | null>(null);
  const [serverLoading, setServerLoading] = useState(false);

  const effectiveUser = useMemo(() => serverUser ?? user, [serverUser, user]);

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated) {
      router.push('/login?redirect=/profile');
      return;
    }

    let cancelled = false;
    (async () => {
      setServerLoading(true);
      const me = await AuthService.getCurrentUser();
      if (!cancelled) {
        setServerUser(me.user ?? null);
        setServerLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, isLoading, router]);

  return (
    <div className="min-h-screen flex flex-col theme-page">
      <Header />
      <main className="flex-1 pt-20 md:pt-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto py-10">
          <div className="flex items-start justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold text-[var(--theme-text)]">Your Profile</h1>
              <p className="text-[var(--theme-text-muted)] mt-1">
                Account details and session information.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Link
                href="/"
                className="theme-button-secondary px-4 py-2 text-sm font-medium rounded-lg transition-colors"
              >
                Home
              </Link>
              <button
                onClick={async () => {
                  await logout();
                  router.push('/login');
                }}
                className="theme-button-primary px-4 py-2 text-sm font-semibold rounded-lg transition-colors"
              >
                {t("common.logOut")}
              </button>
            </div>
          </div>

          {(isLoading || serverLoading) && (
            <div className="theme-panel-muted rounded-2xl p-6">
              <p className="text-sm text-zinc-600">Loading profile…</p>
            </div>
          )}

          {!isLoading && !serverLoading && effectiveUser && (
            <div className="theme-panel rounded-2xl overflow-hidden">
              <div className="p-6 sm:p-8 flex items-center gap-4 border-b border-[var(--theme-border)]">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[var(--theme-accent)] to-[var(--theme-accent-strong)] flex items-center justify-center text-white font-bold text-lg">
                  {effectiveUser.firstName?.[0]}
                  {effectiveUser.lastName?.[0]}
                </div>
                <div className="min-w-0">
                  <p className="text-lg font-semibold text-[var(--theme-text)] truncate">
                    {effectiveUser.fullName}
                  </p>
                  <p className="text-sm text-[var(--theme-text-muted)] truncate">{effectiveUser.email}</p>
                </div>
              </div>

              <div className="p-6 sm:p-8 grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <p className="text-xs font-medium text-[var(--theme-text-muted)]">Role</p>
                  <p className="text-sm font-semibold text-[var(--theme-text)] uppercase tracking-wide">
                    {effectiveUser.role}
                  </p>
                </div>

                <div className="space-y-1">
                  <p className="text-xs font-medium text-[var(--theme-text-muted)]">User ID</p>
                  <p className="text-sm font-mono text-[var(--theme-text)] break-all">{effectiveUser.id}</p>
                </div>

                <div className="space-y-1">
                  <p className="text-xs font-medium text-[var(--theme-text-muted)]">Created</p>
                  <p className="text-sm text-[var(--theme-text)]">
                    {effectiveUser.createdAt
                      ? new Date(effectiveUser.createdAt).toLocaleString()
                      : '—'}
                  </p>
                </div>

                <div className="space-y-1">
                  <p className="text-xs font-medium text-[var(--theme-text-muted)]">Last login</p>
                  <p className="text-sm text-[var(--theme-text)]">
                    {effectiveUser.lastLoginAt
                      ? new Date(effectiveUser.lastLoginAt).toLocaleString()
                      : '—'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {!isLoading && !serverLoading && !effectiveUser && (
            <div className="rounded-2xl border border-[var(--theme-border-strong)] bg-[rgba(232,245,189,0.4)] p-6">
              <p className="text-sm text-[var(--theme-text)]">
                We couldn’t load your profile. Please{' '}
                <button
                  onClick={async () => {
                    await logout();
                    router.push('/login');
                  }}
                  className="theme-link underline font-medium"
                >
                  log out
                </button>{' '}
                and sign in again.
              </p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
