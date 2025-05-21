// src/services/rateService.js
import axios from 'axios';

export const fetchRates = async (propertyId, roomType, startDate, endDate, breakfast) => {
  try {
    const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/rates/search`, {
      params: { 
        propertyId, 
        roomType: roomType.toLowerCase(),
        startDate,
        endDate,
        breakfast
      }
    });
    return response.data;
  } catch (err) {
    console.error('Failed to fetch rates:', err);
    return [];
  }
};