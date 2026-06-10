// contexts/PropertyContext.js
import { createContext, useState, useEffect, useContext } from "react";
import axios from "axios";

const PropertyContext = createContext();

export const useProperty = () => useContext(PropertyContext);

export const PropertyProvider = ({ children }) => {
  const [property, setProperty] = useState(null);
  const [propertyId, setPropertyId] = useState(localStorage.getItem("propertyId"));

  useEffect(() => {
    const handleStorageChange = () => {
      const currentId = localStorage.getItem("propertyId");
      if (currentId !== propertyId) {
        setPropertyId(currentId);
      }
    };

    window.addEventListener("storage", handleStorageChange);
    // Also check periodically or on a custom event if needed, 
    // but for same-tab changes, we can manually trigger it or just use an interval for simplicity in this specific setup
    const interval = setInterval(handleStorageChange, 1000);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      clearInterval(interval);
    };
  }, [propertyId]);

  useEffect(() => {
    if (!propertyId) return;
    axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/property?propertyId=${propertyId}`)
      .then(res => setProperty(res.data))
      .catch(console.error);
  }, [propertyId]);

  return (
    <PropertyContext.Provider value={property}>
      {children}
    </PropertyContext.Provider>
  );
};
export default PropertyProvider;