import { createContext, useContext, useState } from 'react';
import client from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(
    !!localStorage.getItem('access')
  );
  const [username, setUsername] = useState(localStorage.getItem('username') || '');

  async function login(usernameInput, password) {
    const res = await client.post('/auth/login/', { username: usernameInput, password });
    localStorage.setItem('access', res.data.access);
    localStorage.setItem('refresh', res.data.refresh);
    localStorage.setItem('username', usernameInput);
    setUsername(usernameInput);
    setIsAuthenticated(true);
  }

  async function register(usernameInput, email, password) {
    await client.post('/auth/register/', { username: usernameInput, email, password });
    await login(usernameInput, password);
  }

  function logout() {
    localStorage.removeItem('access');
    localStorage.removeItem('refresh');
    localStorage.removeItem('username');
    setIsAuthenticated(false);
    setUsername('');
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, username, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}