import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface User {
  id: string;
  name: string;
  email: string;
  type: 'customer' | 'professional' | 'admin';
  phone?: string;
  postalCode?: string;
  address?: string;
  skills?: string[];
  hourlyRate?: number;
  availability?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string, type: string) => Promise<boolean>;
  signup: (userData: Omit<User, 'id'> & { password: string }) => Promise<boolean>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock users database
const mockUsers: (User & { password: string })[] = [
  {
    id: '1',
    name: 'Admin User',
    email: 'masashitakano917@gmail.com',
    password: 'comocomo917',
    type: 'admin',
    phone: '090-1234-5678',
    postalCode: '100-0001',
    address: '東京都千代田区千代田1-1'
  },
  {
    id: '2',
    name: 'Customer User',
    email: 'of@thisismerci.com',
    password: 'comocomo917',
    type: 'customer',
    phone: '090-2345-6789',
    postalCode: '150-0001',
    address: '東京都渋谷区神宮前1-1'
  },
  {
    id: '3',
    name: '田中太郎',
    email: 'tanaka@example.com',
    password: 'password123',
    type: 'professional',
    phone: '090-3456-7890',
    postalCode: '160-0001',
    address: '東京都新宿区西新宿1-1',
    skills: ['写真撮影', '動画編集'],
    hourlyRate: 3000,
    availability: '平日9:00-18:00'
  }
];

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const login = async (email: string, password: string, type: string): Promise<boolean> => {
    const foundUser = mockUsers.find(
      u => u.email === email && u.password === password && u.type === type
    );

    if (foundUser) {
      const { password: _, ...userWithoutPassword } = foundUser;
      setUser(userWithoutPassword);
      return true;
    }
    return false;
  };

  const signup = async (userData: Omit<User, 'id'> & { password: string }): Promise<boolean> => {
    const existingUser = mockUsers.find(u => u.email === userData.email);
    if (existingUser) {
      return false;
    }

    const newUser = {
      ...userData,
      id: Date.now().toString()
    };

    mockUsers.push(newUser);
    const { password: _, ...userWithoutPassword } = newUser;
    setUser(userWithoutPassword);
    return true;
  };

  const logout = () => {
    setUser(null);
  };

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      
      // Update in mock database
      const userIndex = mockUsers.findIndex(u => u.id === user.id);
      if (userIndex !== -1) {
        mockUsers[userIndex] = { ...mockUsers[userIndex], ...userData };
      }
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, updateUser }}>
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