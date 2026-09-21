import React, { createContext, useState, useEffect } from 'react';

// 1. Create the Context (The "Global Box")
export const AuthContext = createContext();

// 2. Create the Provider (The component that wraps our app and shares the data)
export const AuthProvider = ({ children }) => {
  // State to hold the logged-in user data
  const [user, setUser] = useState(null);
  
  // State to show a loading screen while we check if the user is already logged in
  const [loading, setLoading] = useState(true);

  // When the app starts, check if there's a user saved in the browser's localStorage
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser)); // Convert the text back into an object
    }
    setLoading(false); // Done checking
  }, []);

  // Function to log the user in
  const login = (userData) => {
    setUser(userData); // Update the React state
    localStorage.setItem('user', JSON.stringify(userData)); // Save to browser storage
  };

  // Function to log the user out
  const logout = () => {
    setUser(null); // Clear the React state
    localStorage.removeItem('user'); // Remove from browser storage
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
