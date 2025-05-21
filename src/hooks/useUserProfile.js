// src/hooks/useUserProfile.js
import { useAuth } from '../contexts/AuthContext';

export const useUserProfile = () => {
  const { user } = useAuth();

  return {
    name: user?.displayName || 'Guest',
    email: user?.email || '',
  };
};