import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LoginForm from '../LoginForm';
import { AuthProvider } from '@/lib/auth-context';

// Mock next/navigation
const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

// Mock supabase client
jest.mock('@/lib/supabaseClient', () => ({
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
import { supabase as mockSupabaseClient } from '@/lib/supabaseClient';

describe('LoginForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (mockSupabaseClient.auth.getSession as jest.Mock).mockResolvedValue({
      data: { session: null },
      error: null,
    });
  });

  const renderLoginForm = () => {
    return render(
      <AuthProvider>
        <LoginForm />
      </AuthProvider>
    );
  };

  it('should render login form with all elements', async () => {
    renderLoginForm();

    await waitFor(() => {
      expect(screen.getByText('Academic Insight')).toBeInTheDocument();
      expect(screen.getByText('Masuk ke dashboard analisis kinerja program studi')).toBeInTheDocument();
      expect(screen.getByLabelText('Email')).toBeInTheDocument();
      expect(screen.getByLabelText('Password')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /masuk/i })).toBeInTheDocument();
    });
  });

  it('should have email and password inputs', async () => {
    const user = userEvent.setup();
    renderLoginForm();

    await waitFor(() => {
      expect(screen.getByLabelText('Email')).toBeInTheDocument();
    });

    const emailInput = screen.getByLabelText('Email');
    const passwordInput = screen.getByLabelText('Password');

    expect(emailInput).toHaveAttribute('type', 'email');
    expect(passwordInput).toHaveAttribute('type', 'password');
  });

  it('should update input values when typing', async () => {
    const user = userEvent.setup();
    renderLoginForm();

    await waitFor(() => {
      expect(screen.getByLabelText('Email')).toBeInTheDocument();
    });

    const emailInput = screen.getByLabelText('Email') as HTMLInputElement;
    const passwordInput = screen.getByLabelText('Password') as HTMLInputElement;

    await user.type(emailInput, 'test@university.edu');
    await user.type(passwordInput, 'password123');

    expect(emailInput.value).toBe('test@university.edu');
    expect(passwordInput.value).toBe('password123');
  });

  it('should submit form with valid credentials', async () => {
    const user = userEvent.setup();

    (mockSupabaseClient.auth.signInWithPassword as jest.Mock).mockResolvedValue({
      data: {
        user: {
          id: 'test-user-id',
          email: 'test@university.edu',
        },
      },
      error: null,
    });

    (mockSupabaseClient.from as jest.Mock).mockReturnValue({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({
        data: {
          id: 'test-user-id',
          full_name: 'Test User',
          role: 'admin',
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
        },
        error: null,
      }),
    });

    renderLoginForm();

    await waitFor(() => {
      expect(screen.getByLabelText('Email')).toBeInTheDocument();
    });

    const emailInput = screen.getByLabelText('Email');
    const passwordInput = screen.getByLabelText('Password');
    const submitButton = screen.getByRole('button', { name: /masuk/i });

    await user.type(emailInput, 'test@university.edu');
    await user.type(passwordInput, 'password123');
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockSupabaseClient.auth.signInWithPassword).toHaveBeenCalledWith({
        email: 'test@university.edu',
        password: 'password123',
      });
      expect(mockPush).toHaveBeenCalledWith('/dashboard');
    });
  });

  it('should display error message on login failure', async () => {
    const user = userEvent.setup();

    (mockSupabaseClient.auth.signInWithPassword as jest.Mock).mockResolvedValue({
      data: { user: null },
      error: { message: 'Invalid login credentials' },
    });

    renderLoginForm();

    await waitFor(() => {
      expect(screen.getByLabelText('Email')).toBeInTheDocument();
    });

    const emailInput = screen.getByLabelText('Email');
    const passwordInput = screen.getByLabelText('Password');
    const submitButton = screen.getByRole('button', { name: /masuk/i });

    await user.type(emailInput, 'wrong@university.edu');
    await user.type(passwordInput, 'wrongpassword');
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/email atau password tidak valid/i)).toBeInTheDocument();
    });
  });

  it('should disable form inputs and button while loading', async () => {
    const user = userEvent.setup();

    // Make the sign in take some time
    (mockSupabaseClient.auth.signInWithPassword as jest.Mock).mockImplementation(
      () => new Promise(resolve => setTimeout(() => resolve({
        data: { user: null },
        error: { message: 'Invalid login credentials' },
      }), 100))
    );

    renderLoginForm();

    await waitFor(() => {
      expect(screen.getByLabelText('Email')).toBeInTheDocument();
    });

    const emailInput = screen.getByLabelText('Email') as HTMLInputElement;
    const passwordInput = screen.getByLabelText('Password') as HTMLInputElement;
    const submitButton = screen.getByRole('button', { name: /masuk/i }) as HTMLButtonElement;

    await user.type(emailInput, 'test@university.edu');
    await user.type(passwordInput, 'password123');
    await user.click(submitButton);

    // Check loading state
    await waitFor(() => {
      expect(screen.getByText(/masuk\.\.\./i)).toBeInTheDocument();
    });

    // Wait for completion
    await waitFor(() => {
      expect(screen.getByText(/email atau password tidak valid/i)).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  it('should have proper accessibility attributes', async () => {
    renderLoginForm();

    await waitFor(() => {
      expect(screen.getByLabelText('Email')).toBeInTheDocument();
    });

    const emailInput = screen.getByLabelText('Email');
    const passwordInput = screen.getByLabelText('Password');

    expect(emailInput).toHaveAttribute('type', 'email');
    expect(emailInput).toHaveAttribute('autoComplete', 'email');
    expect(passwordInput).toHaveAttribute('type', 'password');
    expect(passwordInput).toHaveAttribute('autoComplete', 'current-password');
  });
});
