import { useEffect, useState } from 'react';
import API from '../../services/api';

export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await API.get('/auth/me');
        setUser(response.data.data.user);
        setAuthenticated(true);
      } catch (error) {
        console.log('Not authenticated');
        setUser(null);
        setAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const logout = async () => {
    try {
      await API.post('/auth/logout');
      setUser(null);
      setAuthenticated(false);
      window.location.href = '/';
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const switchRole = async () => {
    try {
      const response = await API.post('/auth/switch-role');
      setUser(response.data.data.user);
      return response.data.data.newRole;
    } catch (error) {
      console.error('Failed to switch role:', error);
      throw error;
    }
  };

  const updateGstin = async (gstin) => {
    try {
      const response = await API.put('/auth/gstin', { gstin });
      setUser(response.data.data.user);
      return response.data.data.user;
    } catch (error) {
      console.error('Failed to update GSTIN:', error);
      throw error;
    }
  };

  return {
    user,
    loading,
    authenticated,
    logout,
    switchRole,
    updateGstin
  };
}
