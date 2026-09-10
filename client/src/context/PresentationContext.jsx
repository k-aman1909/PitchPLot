import React, { createContext, useContext, useState } from 'react';

const PresentationContext = createContext();

export const PresentationProvider = ({ children }) => {
  const [activePresentation, setActivePresentation] = useState(null);
  const [activeReport, setActiveReport] = useState(null);
  const [activeSessionTranscript, setActiveSessionTranscript] = useState('');
  const [activeDuration, setActiveDuration] = useState(0);

  return (
    <PresentationContext.Provider value={{
      activePresentation,
      setActivePresentation,
      activeReport,
      setActiveReport,
      activeSessionTranscript,
      setActiveSessionTranscript,
      activeDuration,
      setActiveDuration
    }}>
      {children}
    </PresentationContext.Provider>
  );
};

export const usePresentation = () => useContext(PresentationContext);
