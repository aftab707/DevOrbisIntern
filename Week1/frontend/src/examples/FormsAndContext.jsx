import React, { useState, createContext, useContext } from 'react';

// ==========================================
// TOPIC 6: CONTEXT API (Global State)
// ==========================================
// Context is like a global variable storage. Instead of passing data (like a logged-in user)
// down through multiple components using props, you can store it here and any component can access it directly.

// 1. Create the Context
const UserContext = createContext();

// 2. Create a "Provider" Component that will wrap our application
const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null); // 'null' means no user is logged in yet

  const loginUser = (username) => {
    setUser({ name: username }); // Simulating a login
  };

  const logoutUser = () => {
    setUser(null); // Simulating a logout
  };

  return (
    // We provide 'user', 'loginUser', and 'logoutUser' to the rest of the app
    <UserContext.Provider value={{ user, loginUser, logoutUser }}>
      {children}
    </UserContext.Provider>
  );
};


// ==========================================
// TOPIC 5: FORMS IN REACT
// ==========================================
// This component shows how to handle forms and also uses the Context we created above.
const LoginForm = () => {
  // Local state for the input fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Accessing our global Context
  const { user, loginUser, logoutUser } = useContext(UserContext);

  // Form submit handler
  const handleSubmit = (e) => {
    e.preventDefault(); // Prevents the page from refreshing when the form is submitted
    
    if (email && password) {
      // In a real app, you would send this to your backend using Axios here.
      // For now, we just use our Context to "log the user in" globally.
      loginUser(email);
    }
  };

  return (
    <div style={{ borderTop: '2px solid black', padding: '20px', marginTop: '20px' }}>
      <h2>Topic 5 & 6: Forms and Context API</h2>
      
      {/* If the user is logged in, show a welcome message, otherwise show the form */}
      {user ? (
        <div style={{ padding: '10px', backgroundColor: '#d4edda', color: '#155724' }}>
          <h3>Welcome, {user.name}!</h3>
          <p>You are now globally logged in using Context API.</p>
          <button onClick={logoutUser}>Logout</button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', width: '300px', gap: '10px' }}>
          <label>Email:</label>
          <input 
            type="email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            placeholder="Enter your email" 
            required 
          />
          
          <label>Password:</label>
          <input 
            type="password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            placeholder="Enter your password" 
            required 
          />
          
          <button type="submit">Login</button>
        </form>
      )}
    </div>
  );
};


// ==========================================
// MAIN EXPORT
// ==========================================
// We wrap our Form inside the UserProvider so it has access to the Context
const FormsAndContext = () => {
  return (
    <UserProvider>
      <LoginForm />
    </UserProvider>
  );
};

export default FormsAndContext;
