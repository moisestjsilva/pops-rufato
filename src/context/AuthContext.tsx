import React, { createContext, useContext, useState, useEffect } from 'react';
import { Employee, UserRole } from '../types';
import { initialEmployees } from '../data/mockSeed';

interface AuthContextType {
  currentUser: Employee;
  userRole: UserRole;
  setCurrentUser: (user: Employee) => void;
  switchRole: (role: UserRole) => void;
  allUsersList: Employee[];
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [allUsersList] = useState<Employee[]>(initialEmployees);
  
  // Default to Admin or loaded from localStorage
  const [currentUser, setCurrentUser] = useState<Employee>(() => {
    const savedId = localStorage.getItem('popcontrol_active_user_id');
    if (savedId) {
      const found = initialEmployees.find(e => e.id === savedId);
      if (found) return found;
    }
    return initialEmployees[0]; // Admin by default
  });

  const userRole = currentUser.role;

  const handleSetCurrentUser = (user: Employee) => {
    setCurrentUser(user);
    localStorage.setItem('popcontrol_active_user_id', user.id);
  };

  const switchRole = (role: UserRole) => {
    const target = allUsersList.find(u => u.role === role);
    if (target) {
      handleSetCurrentUser(target);
    }
  };

  return (
    <AuthContext.Provider value={{
      currentUser,
      userRole,
      setCurrentUser: handleSetCurrentUser,
      switchRole,
      allUsersList
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
