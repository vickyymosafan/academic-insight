import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import { AuthProvider, useAuth } from '../auth-context';
import { mockUser, mockProfile } from '@/__mocks__/supabase';

// Mock the supabase client
jest.mock('../supabaseClient', () => ({
  supabase: {
    auth: {
      signInWithPassword: jest.fn(),
      signOut: jest.fn(),
      getSession: jest.fn(),
      getUser: jest.fn(),
      onAuthStateChange: jest.fn(() => ({
        data: { subscription: { unsubscribe: jest.fn() } },
      })),
    },
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn(),
    })),
  },
}));

// Get the mocked supabase client
import { supabase as mockSupabaseClient } from '../supabaseClient';

// Test component to access auth context
function TestComponent() {
  const { user, loading, error } = useAuth();
  
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (user) return <div>User: {user.email}</div>;
  return <div>No user</div>;
}

describe('AuthContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('AuthProvider', () => {
    it('should provide auth context to children', async () => {
      (mockSupabaseClient.auth.getSession as jest.Mock).mockResolvedValue({
        data: { session: null },
        error: null,
      });

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByText('No user')).toBeInTheDocument();
      });
    });

    it('should load user profile on initial session', async () => {
      const mockSession = {
        user: {
          id: mockUser.id,
          email: mockUser.email,
        },
      };

      (mockSupabaseClient.auth.getSession as jest.Mock).mockResolvedValue({
        data: { session: mockSession },
        error: null,
      });

      (mockSupabaseClient.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: mockProfile,
          error: null,
        }),
      });

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByText(`User: ${mockUser.email}`)).toBeInTheDocument();
      });
    });

    it('should handle session error gracefully', async () => {
      (mockSupabaseClient.auth.getSession as jest.Mock).mockResolvedValue({
        data: { session: null },
        error: { message: 'Session error' },
      });

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByText('Error: Gagal memuat session')).toBeInTheDocument();
      });
    });
  });

  describe('useAuth hook', () => {
    it('should throw error when used outside AuthProvider', () => {
      // Suppress console.error for this test
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      expect(() => {
        render(<TestComponent />);
      }).toThrow('useAuth must be used within an AuthProvider');

      consoleSpy.mockRestore();
    });
  });

  describe('signIn', () => {
    it('should sign in user successfully', async () => {
      (mockSupabaseClient.auth.getSession as jest.Mock).mockResolvedValue({
        data: { session: null },
        error: null,
      });

      function SignInTestComponent() {
        const { signIn, user, loading } = useAuth();

        const handleSignIn = async () => {
          await signIn({ email: mockUser.email, password: 'password123' });
        };

        if (loading) return <div>Loading...</div>;
        if (user) return <div>Signed in: {user.email}</div>;

        return <button onClick={handleSignIn}>Sign In</button>;
      }

      (mockSupabaseClient.auth.signInWithPassword as jest.Mock).mockResolvedValue({
        data: {
          user: {
            id: mockUser.id,
            email: mockUser.email,
          },
        },
        error: null,
      });

      (mockSupabaseClient.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: mockProfile,
          error: null,
        }),
      });

      render(
        <AuthProvider>
          <SignInTestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByText('Sign In')).toBeInTheDocument();
      });

      const signInButton = screen.getByText('Sign In');
      
      await act(async () => {
        signInButton.click();
      });

      await waitFor(() => {
        expect(screen.getByText(`Signed in: ${mockUser.email}`)).toBeInTheDocument();
      });
    });

    it('should handle invalid credentials error', async () => {
      (mockSupabaseClient.auth.getSession as jest.Mock).mockResolvedValue({
        data: { session: null },
        error: null,
      });

      function SignInErrorTestComponent() {
        const { signIn, error, loading } = useAuth();

        const handleSignIn = async () => {
          try {
            await signIn({ email: 'wrong@test.com', password: 'wrong' });
          } catch (err) {
            // Error handled by context
          }
        };

        if (loading) return <div>Loading...</div>;
        if (error) return <div>Error: {error}</div>;

        return <button onClick={handleSignIn}>Sign In</button>;
      }

      (mockSupabaseClient.auth.signInWithPassword as jest.Mock).mockResolvedValue({
        data: { user: null },
        error: { message: 'Invalid login credentials' },
      });

      render(
        <AuthProvider>
          <SignInErrorTestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByText('Sign In')).toBeInTheDocument();
      });

      const signInButton = screen.getByText('Sign In');
      
      await act(async () => {
        signInButton.click();
      });

      await waitFor(() => {
        expect(screen.getByText('Error: Email atau password tidak valid')).toBeInTheDocument();
      });
    });
  });

  describe('signOut', () => {
    it('should sign out user successfully', async () => {
      const mockSession = {
        user: {
          id: mockUser.id,
          email: mockUser.email,
        },
      };

      (mockSupabaseClient.auth.getSession as jest.Mock).mockResolvedValue({
        data: { session: mockSession },
        error: null,
      });

      (mockSupabaseClient.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: mockProfile,
          error: null,
        }),
      });

      function SignOutTestComponent() {
        const { signOut, user, loading } = useAuth();

        const handleSignOut = async () => {
          await signOut();
        };

        if (loading) return <div>Loading...</div>;
        if (user) return <button onClick={handleSignOut}>Sign Out</button>;
        return <div>Signed out</div>;
      }

      (mockSupabaseClient.auth.signOut as jest.Mock).mockResolvedValue({
        error: null,
      });

      render(
        <AuthProvider>
          <SignOutTestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByText('Sign Out')).toBeInTheDocument();
      });

      const signOutButton = screen.getByText('Sign Out');
      
      await act(async () => {
        signOutButton.click();
      });

      await waitFor(() => {
        expect(screen.getByText('Signed out')).toBeInTheDocument();
      });
    });
  });
});
