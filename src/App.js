import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Auth from './components/Auth';
import AdminPanel from './components/AdminPanel';
import RankerView from './components/RankerView';
import { getUser as getUserFromAPI } from './utils/api';
import { getAuthToken, storeAuthToken, removeAuthToken, storeUser, getUser as getUserFromStorage, removeUser } from './utils/authUtils';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getAuthToken();
    const storedUser = getUserFromStorage();
    if (token && storedUser) {
      setUser(storedUser);
      setLoading(false);
    } else if (token) {
      fetchUser();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUser = async () => {
    try {
      const userData = await getUserFromAPI();
      setUser(userData.data);
      storeUser(userData.data);
    } catch (error) {
      console.error('Failed to fetch user data:', error);
      handleLogout();
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = (userData, token) => {
    storeAuthToken(token);
    storeUser(userData);
    setUser(userData);
  };

  const handleLogout = () => {
    removeAuthToken();
    removeUser();
    setUser(null);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/rank/:accessCode" element={<RankerView />} />
          <Route path="/" element={
            user ? (
              <AdminPanel user={user} onLogout={handleLogout} />
            ) : (
              <Auth onLogin={handleLogin} />
            )
          } />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
