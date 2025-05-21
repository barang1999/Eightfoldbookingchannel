import React, { useEffect, useState } from 'react';
import axios from "axios";
import StarsLayout from "./StarsLayout";

const HotelProfileHeader = ({ propertyId, fallback = {}, onOpenReview = () => {} }) => {
  const [property, setProperty] = useState(fallback);

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/property?propertyId=${propertyId}`);
        if (res.data) setProperty(res.data);
      } catch (err) {
        console.error("Failed to fetch property info", err);
      }
    };
    if (propertyId) {
      fetchProperty();
    }
  }, [propertyId]);

  return (
    <div className="flex items-start gap-4">
      <div className="flex-1">
        <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wide leading-snug">
          {property?.name || "Hotel Name"}
        </h2>
        <div className="flex items-center gap-1 text-sm text-gray-500 mt-1">
          <span className="flex items-center gap-1">
            Hotels {property?.hotelStarRating || "5"}
            <StarsLayout count={property?.hotelStarRating || 0} />
          </span>
          <button
            onClick={onOpenReview}
            className="text-blue-600 underline ml-1"
          >
            see reviews
          </button>
        </div>
        <div className="text-xs text-gray-500 mt-1">
          Check-in {property?.policy?.checkIn || "2:00 PM"} • Check-out {property?.policy?.checkOut || "12:00 PM"}
        </div>
      </div>
      <img
        src={property?.images?.[0] || ""}
        alt="Hotel Thumbnail"
        className="w-16 h-16 rounded-md object-cover"
      />
    </div>
  );
};

export default HotelProfileHeader;
