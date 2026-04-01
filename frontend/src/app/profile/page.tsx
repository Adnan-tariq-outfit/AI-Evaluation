'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { useAuth } from '../../hooks/useAuth';
import { AuthService } from '../../services/auth.service';
import type { User } from '../../types/auth.types';

export default function ProfilePage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading, logout } = useAuth();
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
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      <main className="flex-1 pt-20 md:pt-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto py-10">
          <div className="flex items-start justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold text-zinc-900">Your Profile</h1>
              <p className="text-zinc-600 mt-1">
                Account details and session information.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Link
                href="/"
                className="px-4 py-2 text-sm font-medium text-zinc-700 rounded-lg hover:bg-zinc-50 transition-colors"
              >
                Home
              </Link>
              <button
                onClick={async () => {
                  await logout();
                  router.push('/login');
                }}
                className="px-4 py-2 text-sm font-semibold text-white bg-[#84B179] rounded-lg hover:bg-[#A2CB8B] transition-colors"
              >
                Log out
              </button>
            </div>
          </div>

          {(isLoading || serverLoading) && (
            <div className="rounded-2xl border border-zinc-100 bg-zinc-50 p-6">
              <p className="text-sm text-zinc-600">Loading profile…</p>
            </div>
          )}

          {!isLoading && !serverLoading && effectiveUser && (
            <div className="rounded-2xl border border-zinc-100 bg-white shadow-sm overflow-hidden">
              <div className="p-6 sm:p-8 flex items-center gap-4 border-b border-zinc-100">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#84B179] to-[#A2CB8B] flex items-center justify-center text-white font-bold text-lg">
                  {effectiveUser.firstName?.[0]}
                  {effectiveUser.lastName?.[0]}
                </div>
                <div className="min-w-0">
                  <p className="text-lg font-semibold text-zinc-900 truncate">
                    {effectiveUser.fullName}
                  </p>
                  <p className="text-sm text-zinc-600 truncate">{effectiveUser.email}</p>
                </div>
              </div>

              <div className="p-6 sm:p-8 grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <p className="text-xs font-medium text-zinc-500">Role</p>
                  <p className="text-sm font-semibold text-zinc-900 uppercase tracking-wide">
                    {effectiveUser.role}
                  </p>
                </div>

                <div className="space-y-1">
                  <p className="text-xs font-medium text-zinc-500">User ID</p>
                  <p className="text-sm font-mono text-zinc-800 break-all">{effectiveUser.id}</p>
                </div>

                <div className="space-y-1">
                  <p className="text-xs font-medium text-zinc-500">Created</p>
                  <p className="text-sm text-zinc-900">
                    {effectiveUser.createdAt
                      ? new Date(effectiveUser.createdAt).toLocaleString()
                      : '—'}
                  </p>
                </div>

                <div className="space-y-1">
                  <p className="text-xs font-medium text-zinc-500">Last login</p>
                  <p className="text-sm text-zinc-900">
                    {effectiveUser.lastLoginAt
                      ? new Date(effectiveUser.lastLoginAt).toLocaleString()
                      : '—'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {!isLoading && !serverLoading && !effectiveUser && (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6">
              <p className="text-sm text-amber-900">
                We couldn’t load your profile. Please{' '}
                <button
                  onClick={async () => {
                    await logout();
                    router.push('/login');
                  }}
                  className="underline font-medium"
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

