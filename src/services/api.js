import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const fetchRooms = async (propertyId, startDate, endDate) => {
  try {
    const params = { propertyId };
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;

    const res = await axios.get(`${BASE_URL}/api/rooms`, { params });
    return res.data;
  } catch (err) {
    console.error("❌ Failed to fetch rooms", err);
    return [];
  }
};
