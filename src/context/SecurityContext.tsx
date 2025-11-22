// src/context/SecurityContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useSecurity } from '../hooks/useSecurity';

interface SecurityContextType {
  isJailbroken: boolean;
  securityBreach: string | null;
  resetSecurityBreach: () => void;
  getSecurityLogs: () => any[];
  setAutoLockTime: (minutes: number) => void;
  scrambleSensitiveData: (data: string) => string;
  unscrambleSensitiveData: (data: string) => string;
  secureClipboard: any;
}

const SecurityContext = createContext<SecurityContextType | undefined>(undefined);

export const SecurityProvider: React.FC<{ 
  children: React.ReactNode; 
  lockVault: () => void;
}> = ({ children, lockVault }) => {
  const security = useSecurity(lockVault);

  return (
    <SecurityContext.Provider value={security}>
      {children}
    </SecurityContext.Provider>
  );
};

export const useSecurityContext = () => {
  const context = useContext(SecurityContext);
  if (context === undefined) {
    throw new Error('useSecurityContext must be used within a SecurityProvider');
  }
  return context;
};