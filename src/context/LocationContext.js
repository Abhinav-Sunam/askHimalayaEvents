import { createContext, useContext, useState, useEffect } from 'react';

const LocationContext = createContext();

export function LocationProvider({ children }) {
  const [location, setLocation] = useState('Darjeeling');

  useEffect(() => {
    const saved = localStorage.getItem('askhimalaya_location');
    let timeoutId;
    if (saved) {
      timeoutId = window.setTimeout(() => setLocation(saved), 0);
    }

    return () => {
      if (timeoutId) window.clearTimeout(timeoutId);
    };
  }, []);

  const changeLocation = (newLoc) => {
    setLocation(newLoc);
    localStorage.setItem('askhimalaya_location', newLoc);
  };

  return (
    <LocationContext.Provider value={{ location, changeLocation }}>
      {children}
    </LocationContext.Provider>
  );
}

export function useLocation() {
  return useContext(LocationContext);
}
