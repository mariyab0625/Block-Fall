import React, { createContext, useContext, useState } from 'react';

const GameContext = createContext(null);

export function GameProvider({ children }) {
  const [selectedLevel, setSelectedLevel] = useState(1);
  const [soundEnabled, setSoundEnabled]   = useState(true);
  const [volume, setVolume]               = useState(0.6);

  return (
    <GameContext.Provider value={{
      selectedLevel, setSelectedLevel,
      soundEnabled, setSoundEnabled,
      volume, setVolume,
    }}>
      {children}
    </GameContext.Provider>
  );
}

export const useGame = () => useContext(GameContext);
