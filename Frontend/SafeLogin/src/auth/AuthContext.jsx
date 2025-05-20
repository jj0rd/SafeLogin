import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Opcjonalnie: po odświeżeniu sprawdź, czy użytkownik nadal jest zalogowany
  useEffect(() => {
    fetch('http://localhost:8080/check-auth', {
      credentials: 'include',
    })
      .then(res => {
        if (res.ok) setIsAuthenticated(true);
      });
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated, setIsAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);