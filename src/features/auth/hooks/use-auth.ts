'use client';

import { useEffect, useRef } from 'react';
import { authClient, signInWithGoogle as _signInWithGoogle } from '@/lib/auth-client';
import { identify, resetIdentity } from '@/lib/analytics';
import { setUser } from '@/lib/monitoring';

export function useAuth() {
  const { data: session, isPending: isLoading } = authClient.useSession();
  const identifiedRef = useRef<string | null>(null);

  useEffect(() => {
    if (session?.user && identifiedRef.current !== session.user.id) {
      identifiedRef.current = session.user.id;
      identify(session.user.id, session.user.email);
      setUser({ id: session.user.id, email: session.user.email });
    } else if (!session?.user && identifiedRef.current) {
      identifiedRef.current = null;
      resetIdentity();
      setUser(null);
    }
  }, [session?.user]);

  const signIn = authClient.signIn.email;

  const signOut = async () => {
    await authClient.signOut();
    resetIdentity();
    setUser(null);
  };

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
