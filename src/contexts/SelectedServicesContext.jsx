import React, { createContext, useContext, useEffect, useState } from 'react';

const SelectedServicesContext = createContext();

export const SelectedServicesProvider = ({ children }) => {
  const [selectedServices, setSelectedServices] = useState(() => {
    const stored = localStorage.getItem('selectedServices');
    return stored ? JSON.parse(stored) : [];
  });

  useEffect(() => {
    localStorage.setItem('selectedServices', JSON.stringify(selectedServices));
  }, [selectedServices]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('selectedServicesUpdated'));
    }
  }, [selectedServices]);

  const addService = (service) => {
    const uniqueService = { ...service, instanceId: Date.now() + Math.random() };
    setSelectedServices((prev) => [...prev, uniqueService]);
  };

  const removeService = (instanceId) => {
    setSelectedServices((prev) =>
      prev.filter((s) => s.instanceId !== instanceId)
    );
  };

  const clearServices = () => setSelectedServices([]);

  const updateService = (instanceId, updates) => {
    setSelectedServices((prev) =>
      prev.map((s) =>
        s.instanceId === instanceId ? { ...s, ...updates } : s
      )
    );
  };

  return (
    <SelectedServicesContext.Provider
      value={{
        selectedServices,
        addService,
        removeService,
        clearServices,
        updateService,
      }}
    >
      {children}
    </SelectedServicesContext.Provider>
  );
};

export const useSelectedServices = () => useContext(SelectedServicesContext);
