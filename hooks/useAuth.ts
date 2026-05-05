'use client';

import { useContext } from 'react';
import { AuthContext } from '@/providers/AuthProvider';

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth は AuthProvider の中で使用してください');
  }
  return context;
}