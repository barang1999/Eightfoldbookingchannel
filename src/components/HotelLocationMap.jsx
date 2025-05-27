import React, { useEffect, useState } from "react";
import DOMPurify from "dompurify";
import { Phone, Mail } from "lucide-react";
import axios from "axios";

const HotelLocationMap = ({ propertyId }) => {
  const [property, setProperty] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/property?propertyId=${propertyId}`);
        const data = res.data;
        setProperty(data);
      } catch (err) {
        console.error("❌ Failed to fetch property:", err);
      }
    };

    if (propertyId) fetchData();
  }, [propertyId]);

  if (!property) return null;

  return (
    <div className="w-full mt-12 pt-6 px-0">
      <h2 className="text-2xl font-semibold text-gray-800 mb-4">Hotel location</h2>
      <div className="bg-white rounded shadow overflow-hidden">
        <div className="w-full overflow-hidden rounded-lg relative">
          <style>{`
            .map-container iframe {
              width: 100% !important;
              height: 100% !important;
              min-height: 420px;
              display: block;
            }
          `}</style>
          <div
            className="map-container"
            dangerouslySetInnerHTML={{
              __html: DOMPurify.sanitize(property.googleMapEmbed || "", {
                ADD_TAGS: ["iframe"],
                ADD_ATTR: ["allow", "allowfullscreen", "frameborder", "scrolling"],
              }),
            }}
          />
        </div>
        <div className="text-sm text-gray-700 flex flex-col md:flex-row justify-between gap-8 p-6">
          <div className="flex-1">
            <p className="mb-2 font-medium whitespace-pre-line">{property.address}</p>
            <p className="mt-2">
              Check-in from {property.policy?.checkIn || "02:00 PM"} – Check out up to {property.policy?.checkOut || "12:00 PM"}
            </p>
          </div>
          <div className="flex-1 flex flex-col justify-start md:items-start items-center space-y-2 text-[#A58E63] pl-0 md:pl-20">
            <p className="flex items-center gap-2">
              <Phone className="w-4 h-4" color="#A58E63" /> 
              <a href={`tel:${property.phone}`} className="underline text-[#A58E63]">{property.phone}</a>
            </p>
            <p className="flex items-center gap-2">
              <Mail className="w-4 h-4" color="#A58E63" /> 
              <a href={`mailto:${property.email}`} className="underline text-[#A58E63]">{property.email}</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HotelLocationMap;