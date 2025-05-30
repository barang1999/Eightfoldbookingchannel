// contexts/PropertyContext.js
import { createContext, useState, useEffect, useContext } from "react";
import axios from "axios";

const PropertyContext = createContext();

export const useProperty = () => useContext(PropertyContext);

export const PropertyProvider = ({ children }) => {
  const [property, setProperty] = useState(null);
  const propertyId = localStorage.getItem("propertyId");

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