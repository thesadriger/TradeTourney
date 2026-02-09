
import React, { useState } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import LobbyPage from './pages/LobbyPage';
import TerminalPage from './pages/TerminalPage';
import WalletPage from './pages/WalletPage';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userBalance, setUserBalance] = useState(1240.50);

  const handleLogin = () => setIsAuthenticated(true);
  const handleLogout = () => setIsAuthenticated(false);

  const updateBalance = (amount: number) => {
    setUserBalance(prev => prev + amount);
  };

  return (
    <HashRouter>
      <Routes>
        <Route 
          path="/" 
          element={!isAuthenticated ? <LandingPage onLogin={handleLogin} /> : <Navigate to="/lobby" />} 
        />
        <Route 
          path="/lobby" 
          element={isAuthenticated ? <LobbyPage balance={userBalance} onLogout={handleLogout} onUpdateBalance={updateBalance} /> : <Navigate to="/" />} 
        />
        <Route 
          path="/terminal/:id" 
          element={isAuthenticated ? <TerminalPage balance={userBalance} /> : <Navigate to="/" />} 
        />
        <Route 
          path="/wallet" 
          element={isAuthenticated ? <WalletPage balance={userBalance} /> : <Navigate to="/" />} 
        />
      </Routes>
    </HashRouter>
  );
};

export default App;
