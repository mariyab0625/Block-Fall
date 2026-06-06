import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { GameProvider } from './context/GameContext';
import HomePage from './components/Home/HomePage';
import GamePage from './components/Game/GamePage';
import './styles/globals.css';
import './styles/animations.css';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <GameProvider>
          <Routes>
            <Route path="/"     element={<HomePage />} />
            <Route path="/game" element={<GamePage />} />
            <Route path="*"     element={<Navigate to="/" replace />} />
          </Routes>
        </GameProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
