// Authentication Types

export interface AuthUser {
  id: string;
  email: string;
  role: 'dosen' | 'admin';
  profile: UserProfile;
}

export interface UserProfile {
  id: string;
  user_id: string;
  full_name: string;
  avatar_url?: string;
  department?: string;
  created_at: string;
  updated_at: string;
}

export interface AuthError {
  code: string;
  message: string;
  details?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  signIn: (credentials: LoginCredentials) => Promise<void>;
  signOut: () => Promise<void>;
  error: string | null;
}