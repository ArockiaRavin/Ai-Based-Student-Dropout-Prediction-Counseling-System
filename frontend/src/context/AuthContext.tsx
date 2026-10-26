import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User } from '../types';
import { api } from '../api';

interface AuthContextType {
  user: User | null;
  role: 'Administrator' | 'Counselor' | 'Viewer';
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (usernameOrEmail: string, password?: string) => Promise<User>;
  register: (data: { name: string; email: string; password: string; role: string; department?: string }) => Promise<any>;
  setupInitialAdmin: (data: {
    setup_key: string;
    name: string;
    email: string;
    password: string;
    department?: string;
    username?: string;
  }) => Promise<any>;
  logout: () => void;
  loginAs: (role: 'Administrator' | 'Counselor' | 'Viewer') => Promise<void>;
  refreshProfile: () => Promise<void>;
  updateProfile: (data: { name?: string; department?: string; current_password?: string; new_password?: string }) => Promise<User>;
  
  // Role & permission helpers
  isAdmin: boolean;
  isCounselor: boolean;
  isViewer: boolean;
  canEditStudents: boolean;
  canDeleteStudents: boolean;
  canManageInterventions: boolean;
  canManageSettings: boolean;
  canManageUsers: boolean;
  isPendingApproval: boolean;
  isDeactivated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('eduretain_token'));
  
  // Load real authenticated user from local storage; NEVER substitute a hardcoded default name
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('eduretain_user');
    if (savedUser) {
      try {
        return JSON.parse(savedUser);
      } catch (e) {
        console.error('Failed to parse saved user:', e);
      }
    }
    return null;
  });

  // Avoid blocking full-screen loading when authenticated user is already cached locally
  const [isLoading, setIsLoading] = useState<boolean>(() => {
    const savedToken = localStorage.getItem('eduretain_token');
    const savedUser = localStorage.getItem('eduretain_user');
    if (!savedToken) return false;
    return !savedUser;
  });

  const role: 'Administrator' | 'Counselor' | 'Viewer' = user?.role || 'Viewer';

  // Synchronize authenticated profile with backend using the authenticated session token
  const refreshProfile = useCallback(async () => {
    const savedToken = localStorage.getItem('eduretain_token');
    if (!savedToken) {
      setUser(null);
      setIsLoading(false);
      return;
    }
    try {
      const res = await api.getMe();
      if (res && res.user) {
        setUser(res.user);
        localStorage.setItem('eduretain_user', JSON.stringify(res.user));
        localStorage.setItem('eduretain_role', res.user.role);
      } else {
        setUser(null);
        localStorage.removeItem('eduretain_user');
        localStorage.removeItem('eduretain_token');
        localStorage.removeItem('eduretain_role');
      }
    } catch (err: any) {
      console.warn('Could not refresh profile with token:', err);
      // Clean up stale session ONLY if server explicitly reports unauthorized / expired token
      const status = err?.status;
      const isAuthError = status === 401 || status === 403 ||
        err?.message?.includes('401') ||
        err?.message?.includes('Unauthorized') ||
        err?.message?.includes('expired') ||
        err?.message?.includes('not found in database');

      if (isAuthError) {
        setUser(null);
        setToken(null);
        localStorage.removeItem('eduretain_user');
        localStorage.removeItem('eduretain_token');
        localStorage.removeItem('eduretain_role');
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshProfile();
  }, [refreshProfile]);

  const updateProfile = async (data: { name?: string; department?: string; current_password?: string; new_password?: string }): Promise<User> => {
    setIsLoading(true);
    try {
      const res = await api.updateProfile(data);
      if (res && res.user) {
        setUser(res.user);
        localStorage.setItem('eduretain_user', JSON.stringify(res.user));
        localStorage.setItem('eduretain_role', res.user.role);
        return res.user;
      }
      throw new Error('Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (usernameOrEmail: string, password: string = 'password'): Promise<User> => {
    setIsLoading(true);
    try {
      const res = await api.login(usernameOrEmail, password);
      setToken(res.token);
      setUser(res.user);
      localStorage.setItem('eduretain_token', res.token);
      localStorage.setItem('eduretain_user', JSON.stringify(res.user));
      localStorage.setItem('eduretain_role', res.user.role);
      return res.user;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: { name: string; email: string; password: string; role: string; department?: string }) => {
    setIsLoading(true);
    try {
      const res = await api.register(data);
      if (res.token) {
        setToken(res.token);
        setUser(res.user);
        localStorage.setItem('eduretain_token', res.token);
        localStorage.setItem('eduretain_user', JSON.stringify(res.user));
        localStorage.setItem('eduretain_role', res.user.role);
      }
      return res;
    } finally {
      setIsLoading(false);
    }
  };

  const setupInitialAdmin = async (data: {
    setup_key: string;
    name: string;
    email: string;
    password: string;
    department?: string;
    username?: string;
  }) => {
    setIsLoading(true);
    try {
      const res = await api.setupInitialAdmin(data);
      if (res.token) {
        setToken(res.token);
        setUser(res.user);
        localStorage.setItem('eduretain_token', res.token);
        localStorage.setItem('eduretain_user', JSON.stringify(res.user));
        localStorage.setItem('eduretain_role', res.user.role);
      }
      return res;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    try {
      api.logout().catch(() => {});
    } catch (e) {}
    setToken(null);
    setUser(null);
    localStorage.removeItem('eduretain_token');
    localStorage.removeItem('eduretain_user');
    localStorage.removeItem('eduretain_role');
  };

  // Demo role switcher: authenticates through backend with seed credentials
  const loginAs = async (newRole: 'Administrator' | 'Counselor' | 'Viewer') => {
    setIsLoading(true);
    try {
      const demoUsername = newRole === 'Administrator' ? 'admin' : newRole === 'Counselor' ? 'counselor' : 'faculty';
      const demoPw = newRole === 'Administrator' ? 'admin123' : newRole === 'Counselor' ? 'counselor123' : 'faculty123';
      try {
        const res = await api.login(demoUsername, demoPw);
        setToken(res.token);
        setUser(res.user);
        localStorage.setItem('eduretain_token', res.token);
        localStorage.setItem('eduretain_user', JSON.stringify(res.user));
        localStorage.setItem('eduretain_role', res.user.role);
      } catch (firstErr) {
        // Fallback check with password123
        const res = await api.login(demoUsername, 'password123');
        setToken(res.token);
        setUser(res.user);
        localStorage.setItem('eduretain_token', res.token);
        localStorage.setItem('eduretain_user', JSON.stringify(res.user));
        localStorage.setItem('eduretain_role', res.user.role);
      }
    } catch (err: any) {
      console.error(`Could not switch role to ${newRole}:`, err);
    } finally {
      setIsLoading(false);
    }
  };

  // Permission checks
  const isAdmin = role === 'Administrator';
  const isCounselor = role === 'Counselor';
  const isViewer = role === 'Viewer';

  const canEditStudents = isAdmin || isCounselor;
  const canDeleteStudents = isAdmin;
  const canManageInterventions = isAdmin || isCounselor;
  const canManageSettings = isAdmin;
  const canManageUsers = isAdmin;

  const isPendingApproval = user?.status === 'pending';
  const isDeactivated = user?.status === 'deactivated';
  const isAuthenticated = !!user && !isPendingApproval && !isDeactivated;

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        token,
        isAuthenticated,
        isLoading,
        login,
        register,
        setupInitialAdmin,
        logout,
        loginAs,
        refreshProfile,
        updateProfile,
        isAdmin,
        isCounselor,
        isViewer,
        canEditStudents,
        canDeleteStudents,
        canManageInterventions,
        canManageSettings,
        canManageUsers,
        isPendingApproval,
        isDeactivated,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
