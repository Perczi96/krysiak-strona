import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session, AuthError } from '@supabase/supabase-js';
import { supabase, getProfile, type ProfileWithTier } from '@/lib/supabase';
import { useToast } from '@/components/ui/Toaster';

interface AuthContextValue {
  user: User | null;
  profile: ProfileWithTier | null;
  session: Session | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signUp: (email: string, password: string, displayName?: string) => Promise<{ error: AuthError | null }>;
  signInWithOAuth: (provider: 'google') => Promise<{ error: AuthError | null }>;
  signInWithMagicLink: (email: string) => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: AuthError | null }>;
  updatePassword: (newPassword: string) => Promise<{ error: AuthError | null }>;
  updateProfile: (updates: { display_name?: string; avatar_url?: string }) => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<ProfileWithTier | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Initialize auth state
  useEffect(() => {
    let mounted = true;

    const initAuth = async () => {
      const { data: { session: initialSession } } = await supabase.auth.getSession();

      if (mounted) {
        setSession(initialSession);
        setUser(initialSession?.user ?? null);

        if (initialSession?.user) {
          const userProfile = await getProfile(initialSession.user.id);
          setProfile(userProfile);
        }

        setIsLoading(false);
      }
    };

    initAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      if (!mounted) return;

      setSession(newSession);
      setUser(newSession?.user ?? null);

      if (newSession?.user) {
        const userProfile = await getProfile(newSession.user.id);
        setProfile(userProfile);

        // Show welcome toast on sign in
        if (event === 'SIGNED_IN') {
          toast({
            type: 'success',
            title: 'Zalogowano',
            message: `Witaj, ${userProfile?.display_name || 'użytkowniku'}!`
          });
        }
      } else {
        setProfile(null);

        if (event === 'SIGNED_OUT') {
          toast({
            type: 'info',
            title: 'Wylogowano',
            message: 'Do zobaczenia wkrótce!'
          });
        }
      }

      setIsLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [toast]);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error };
  };

  const signUp = async (email: string, password: string, displayName?: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { display_name: displayName },
        emailRedirectTo: `${window.location.origin}/auth?verified=true`
      }
    });
    return { error };
  };

  const signInWithOAuth = async (provider: 'google') => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth?oauth=true`,
        queryParams: { access_type: 'offline', prompt: 'consent' }
      }
    });
    return { error };
  };

  const signInWithMagicLink = async (email: string) => {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth?magic=true`,
        shouldCreateUser: true
      }
    });
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth?reset=true`
    });
    return { error };
  };

  const updatePassword = async (newPassword: string) => {
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    return { error };
  };

  const updateProfile = async (updates: { display_name?: string; avatar_url?: string }) => {
    const { data: { user: currentUser } } = await supabase.auth.getUser();
    if (!currentUser) return;

    const { error } = await supabase.auth.updateUser({ data: updates });
    if (!error) {
      const userProfile = await getProfile(currentUser.id);
      setProfile(userProfile);
    }
  };

  const refreshProfile = async () => {
    const { data: { user: currentUser } } = await supabase.auth.getUser();
    if (currentUser) {
      const userProfile = await getProfile(currentUser.id);
      setProfile(userProfile);
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      profile,
      session,
      isLoading,
      signIn,
      signUp,
      signInWithOAuth,
      signInWithMagicLink,
      signOut,
      resetPassword,
      updatePassword,
      updateProfile,
      refreshProfile
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Helper hooks
export function useUser() {
  const { user, isLoading } = useAuth();
  return { user, isLoading };
}

export function useProfile() {
  const { profile, isLoading } = useAuth();
  return { profile, isLoading };
}

export function useSession() {
  const { session, isLoading } = useAuth();
  return { session, isLoading };
}

export function useIsSupporter() {
  const { profile } = useAuth();
  return profile?.role === 'supporter' && profile?.subscription_status === 'active';
}

export function useIsAdmin() {
  const { profile } = useAuth();
  return profile?.role === 'admin';
}

export function useCanAccessContent(contentVisibility: 'public' | 'subscriber' | 'supporter', contentTierId?: string): boolean {
  const { profile } = useAuth();

  if (contentVisibility === 'public') return true;
  if (!profile) return false;

  if (contentVisibility === 'subscriber') return true; // Any authenticated user
  if (contentVisibility === 'supporter') {
    if (profile.role !== 'supporter' || profile.subscription_status !== 'active') return false;
    if (!contentTierId) return true; // Any tier
    return profile.tier_id === contentTierId; // Simplified - RLS handles hierarchy
  }
  return false;
}