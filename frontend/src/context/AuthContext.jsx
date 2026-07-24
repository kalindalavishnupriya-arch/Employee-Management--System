import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axiosInstance';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user_info');
    return saved ? JSON.parse(saved) : null;
  });

  const [token, setToken] = useState(() => localStorage.getItem('access_token'));

  useEffect(() => {
    if (token && !user) {
      api.get('/auth/me')
        .then(res => {
          const userInfo = {
            username: res.data.username,
            role: res.data.role,
            employeeId: res.data.employeeId
          };
          setUser(userInfo);
          localStorage.setItem('user_info', JSON.stringify(userInfo));
        })
        .catch(() => {
          logout();
        });
    }
  }, [token]);

  const login = async (username, password) => {
    const res = await api.post('/auth/login', { username, password });
    const { token, role, employeeId } = res.data;
    const userInfo = { username, role, employeeId };

    localStorage.setItem('access_token', token);
    localStorage.setItem('user_info', JSON.stringify(userInfo));
    setToken(token);
    setUser(userInfo);
    return userInfo;
  };

  const registerUser = async (registrationData) => {
    const { username, password, role, email, firstName, lastName } = registrationData;
    const params = new URLSearchParams();
    if (role) params.append('role', role);
    if (email) params.append('email', email);
    if (firstName) params.append('firstName', firstName);
    if (lastName) params.append('lastName', lastName);

    const res = await api.post(`/auth/register?${params.toString()}`, { username, password });
    return res.data;
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user_info');
    setToken(null);
    setUser(null);
  };

  const isAdmin = user?.role === 'ROLE_ADMIN' || user?.role === 'ADMIN';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAdmin,
        isLoggedIn: !!token,
        login,
        registerUser,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
