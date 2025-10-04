'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from './supabaseClient';
import type { AuthUser, AuthContextType, LoginCredentials, UserProfile } from '@/types/auth';
import type { Profile } from '@/types/database';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
          setError('Gagal memuat session');
          return;
        }

        if (session?.user) {
          await loadUserProfile(session.user);
        }
      } catch (err) {
        console.error('Error in getInitialSession:', err);
        setError('Terjadi kesalahan saat memuat session');
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        
        if (event === 'SIGNED_IN' && session?.user) {
          await loadUserProfile(session.user);
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setError(null);
        } else if (event === 'TOKEN_REFRESHED' && session?.user) {
          await loadUserProfile(session.user);
        }
        
        setLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const loadUserProfile = async (authUser: User) => {
    try {
      setLoading(true);
      setError(null);

      // Get user profile from profiles table
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .single();

      let userProfile: Profile | null = profile;

      if (profileError) {
        console.error('Error loading profile:', profileError);
        
        // If profile doesn't exist, create a default one
        if (profileError.code === 'PGRST116') {
          const newProfile: Omit<Profile, 'created_at' | 'updated_at'> = {
            id: authUser.id,
            full_name: authUser.email?.split('@')[0] || 'User',
            avatar_url: undefined,
            department: undefined,
            role: 'dosen',
          };

          const { data: createdProfile, error: createError } = await supabase
            .from('profiles')
            .insert(newProfile as any)
            .select()
            .single();

          if (createError) {
            console.error('Error creating profile:', createError);
            setError('Gagal membuat profil pengguna');
            return;
          }

          userProfile = createdProfile as Profile;
        } else {
          setError('Gagal memuat profil pengguna');
          return;
        }
      }

      if (!userProfile) {
        setError('Profil pengguna tidak ditemukan');
        return;
      }

      const authUserData: AuthUser = {
        id: authUser.id,
        email: authUser.email || '',
        role: userProfile.role || 'dosen',
        profile: {
          id: userProfile.id,
          user_id: userProfile.id,
          full_name: userProfile.full_name,
          avatar_url: userProfile.avatar_url || undefined,
          department: userProfile.department || undefined,
          created_at: userProfile.created_at,
          updated_at: userProfile.updated_at,
        },
      };

      setUser(authUserData);
    } catch (err) {
      console.error('Error in loadUserProfile:', err);
      setError('Terjadi kesalahan saat memuat profil');
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (credentials: LoginCredentials) => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      });

      if (error) {
        console.error('Sign in error:', error);
        
        // Handle specific error cases
        switch (error.message) {
          case 'Invalid login credentials':
            setError('Email atau password tidak valid');
            break;
          case 'Email not confirmed':
            setError('Silakan konfirmasi email Anda terlebih dahulu');
            break;
          case 'Too many requests':
            setError('Terlalu banyak percobaan login. Coba lagi nanti');
            break;
          default:
            setError('Terjadi kesalahan saat login. Silakan coba lagi');
        }
        throw error;
      }

      if (data.user) {
        await loadUserProfile(data.user);
      }
    } catch (err) {
      // Error already handled above
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      setError(null);

      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Sign out error:', error);
        setError('Gagal logout');
        throw error;
      }

      setUser(null);
    } catch (err) {
      console.error('Error in signOut:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    signIn,
    signOut,
    error,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
}