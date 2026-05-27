'use client';

import { authClient, signInWithGoogle as _signInWithGoogle } from '@/lib/auth-client';

export function useAuth() {
  const { data: session, isPending: isLoading } = authClient.useSession();

  const signIn = authClient.signIn.email;
  const signOut = authClient.signOut;
  const signInWithGoogle = (locale: string) =>
    _signInWithGoogle(`/${locale}/pantry`);

  return {
    user: session?.user ?? null,
    session,
    isLoading,
    signIn,
    signOut,
    signInWithGoogle,
  };
}
