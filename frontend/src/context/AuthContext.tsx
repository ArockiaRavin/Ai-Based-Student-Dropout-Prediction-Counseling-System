import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { api } from '../api';

interface AuthContextType {
  user: User | null;
  role: 'Administrator' | 'Counselor' | 'Viewer';
  loginAs: (role: 'Administrator' | 'Counselor' | 'Viewer') => void;
  logout: () => void;
  canEditStudents: boolean;
  canDeleteStudents: boolean;
  canManageInterventions: boolean;
  canManageSettings: boolean;
}

const DEFAULT_USERS: Record<string, User> = {
  Administrator: {
    id: 1,
    username: 'admin',
    name: 'Dr. Rajesh Ramanathan',
    email: 'admin@eduretain.edu',
    role: 'Administrator',
    department: 'Institute Administration',
  },
  Counselor: {
    id: 2,
    username: 'counselor',
    name: 'Prof. Sunita Krishnan',
    email: 'counselor@eduretain.edu',
    role: 'Counselor',
    department: 'Student Welfare & Guidance',
  },
  Viewer: {
    id: 3,
    username: 'faculty',
    name: 'Dr. Amitava Sen',
    email: 'faculty@eduretain.edu',
    role: 'Viewer',
    department: 'Faculty of Computer Science',
  },
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [role, setRole] = useState<'Administrator' | 'Counselor' | 'Viewer'>(() => {
    return (localStorage.getItem('eduretain_role') as any) || 'Counselor';
  });

  const [user, setUser] = useState<User>(DEFAULT_USERS[role]);

  useEffect(() => {
    setUser(DEFAULT_USERS[role]);
    localStorage.setItem('eduretain_role', role);
  }, [role]);

  const loginAs = (newRole: 'Administrator' | 'Counselor' | 'Viewer') => {
    setRole(newRole);
  };

  const logout = () => {
    setRole('Viewer');
  };

  const canEditStudents = role === 'Administrator' || role === 'Counselor';
  const canDeleteStudents = role === 'Administrator';
  const canManageInterventions = role === 'Administrator' || role === 'Counselor';
  const canManageSettings = role === 'Administrator';

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        loginAs,
        logout,
        canEditStudents,
        canDeleteStudents,
        canManageInterventions,
        canManageSettings,
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
