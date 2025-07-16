export interface User {
  uid: string;
  email: string;
  displayName?: string;
  name?: string;
  company?: string;
  phone?: string;
  photoURL?: string;
  emailVerified: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthUser extends User {
  accessToken?: string;
}

export interface RegisterData {
  name: string;
  email: string;
  company: string;
  phone: string;
  password: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<AuthUser>;
  register: (data: RegisterData) => Promise<AuthUser>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
}

export interface AuthState {
  user: AuthUser | null;
  loading: boolean;
  error: string | null;
}
