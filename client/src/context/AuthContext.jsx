import React, { createContext, useContext, useState, useEffect } from 'react';
import { getMe } from '../utils/api';

const AuthContext = createContext(null);

// 5 avatar options — SVG emoji paths rendered inline
export const AVATARS = [
  { id: 'default', label: 'Block',    emoji: '🟦' },
  { id: 'alien',   label: 'Alien',    emoji: '👾' },
  { id: 'robot',   label: 'Robot',    emoji: '🤖' },
  { id: 'ninja',   label: 'Ninja',    emoji: '🥷' },
  { id: 'ghost',   label: 'Ghost',    emoji: '👻' },
];

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null);
  const [loading, setLoading] = useState(true);
  // Profile pic persisted in localStorage so it survives refresh
  const [avatarId, setAvatarId] = useState(
    () => localStorage.getItem('bf_avatar') || 'default'
  );

  useEffect(() => {
    const token = localStorage.getItem('bf_token');
    if (token) {
      getMe()
        .then(res => setUser(res.data.user))
        .catch(() => localStorage.removeItem('bf_token'))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = (token, userData) => {
    localStorage.setItem('bf_token', token);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('bf_token');
    setUser(null);
  };

  const changeAvatar = (id) => {
    localStorage.setItem('bf_avatar', id);
    setAvatarId(id);
  };

  const avatar = AVATARS.find(a => a.id === avatarId) || AVATARS[0];

  return (
    <AuthContext.Provider value={{
      user, loading, login, logout,
      isLoggedIn: !!user,
      avatar, avatarId, changeAvatar,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
