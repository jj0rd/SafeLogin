import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetch('http://localhost:8080/check-auth', {
      credentials: 'include',
    })
      .then(res => {
        if (res.ok) {
          setIsAuthenticated(true);
          fetch('http://localhost:8080/current-user', {
            credentials: 'include',
          })
            .then(r => r.json())
            .then(data => setUser(data));
        } else {
          setIsAuthenticated(false);
          setUser(null);
        }
      });
  }, []);

  const login = (userData) => {
    setIsAuthenticated(true);
    setUser(userData);
  };

  const logout = () => {
    fetch('http://localhost:8080/logout', {
      method: 'POST',
      credentials: 'include',
    }).then(() => {
      setIsAuthenticated(false);
      setUser(null);
    });
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, setIsAuthenticated, user, setUser, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);