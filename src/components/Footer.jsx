import { useEffect, useState } from "react";
import HotelFacilityModal from "./HotelFacilitySection";
import HotelPolicyModal from "./HotelPolicySection";
import axios from "axios";
import { FaFacebookF, FaInstagram } from 'react-icons/fa';

export default function Footer({ propertyId }) {
  const [property, setProperty] = useState(null);
  const [facilities, setFacilities] = useState([]);
  const [showFacilities, setShowFacilities] = useState(false);
  const [showPolicies, setShowPolicies] = useState(false);
  console.log("📌 selectedPropertyId in Footer:", propertyId);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/property?propertyId=${propertyId}`);
        setProperty(res.data);
      } catch (err) {
        console.error("Failed to fetch footer property data", err);
      }
    };
    const fetchFacilities = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/facilities/${propertyId}`);
        setFacilities(res.data);
      } catch (err) {
        console.error("❌ Failed to fetch facilities:", err);
      }
    };
    if (propertyId) {
      fetchData();
      fetchFacilities();
    }
  }, [propertyId]);

  if (!property) return <div className="text-center text-sm text-gray-400">Loading footer...</div>;

  return (
    <footer className="bg-white text-gray-800 px-10 py-24 mt-5 pb-32 md:pb-30 text-center">
      <div className="flex flex-col items-center justify-center mb-8 space-y-2">
        
        <h3 className="text-2xl font-serif mb-4">Get social</h3>
        <div className="flex space-x-4">
          <a
            href={property?.socialLinks?.facebook || "#"}
            className="text-gray-800 hover:text-[#8a6b41] text-xl"
            target="_blank"
            rel="noopener noreferrer"
          >
            <FaFacebookF />
          </a>
          <a
            href={property?.socialLinks?.instagram || "#"}
            className="text-gray-800 hover:text-[#8a6b41] text-xl"
            target="_blank"
            rel="noopener noreferrer"
          >
            <FaInstagram />
          </a>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 text-left gap-12 w-full max-w-6xl mx-auto mt-8 justify-items-center">
        <div className="w-full md:w-auto md:text-left text-center">
          <h4 className="text-lg font-light mb-2 font-serif text-gray-700">Location</h4>
          <p className="text-sm leading-relaxed text-gray-600 font-light">
            {property?.address
              ? property.address.split('\n').map((line, i) => <span key={i}>{line}<br /></span>)
              : <span className="text-gray-400">Address not available</span>}
            <a
              href={property?.googleMapLink || "#"}
              className="text-[#8a6b41] underline font-light"
              target="_blank"
              rel="noopener noreferrer"
            >
              Get Directions
            </a>
          </p>
        </div>
        <div className="w-full md:w-auto md:text-left text-center">
          <h4 className="text-lg font-light mb-2 font-serif text-gray-700">Reservation</h4>
          <p className="text-sm leading-relaxed text-gray-600 font-light">
            {property?.phone
              ? <a href={`tel:${property.phone}`} className="underline text-[#8a6b41] font-light">Tel: {property.phone}</a>
              : <span className="text-gray-400">Phone not available</span>}<br />
            {property?.email
              ? <a href={`mailto:${property.email}`} className="underline text-[#8a6b41] font-light">Mail: {property.email}</a>
              : <span className="text-gray-400">Email not available</span>}
          </p>
        </div>
        <div className="w-full md:w-auto md:text-left text-center">
          <h4 className="text-lg font-light mb-2 font-serif text-gray-700">Parking</h4>
          <p className="text-sm leading-relaxed text-gray-600 font-light">
            {(facilities.find(f => f.category.toLowerCase().includes('parking'))?.items || [])
              .filter(item => item === "Parking Included" || item === "Outdoor Parking")
              .map((item, i) => (
                <span key={i}>{item}<br /></span>
              )) || <span className="text-gray-400">Parking info not available</span>}
          </p>
        </div>
        <div className="w-full md:w-auto text-center">
          <h4 className="text-lg font-light mb-2 font-serif text-gray-700">Property</h4>
          <p className="text-sm leading-relaxed text-gray-600 font-light flex flex-col items-center">
            <button
              onClick={() => setShowPolicies(true)}
              className="underline text-[#8a6b41] font-light block mb-1"
            >
              View Hotel Policies
            </button>
            <button
              onClick={() => setShowFacilities(true)}
              className="underline text-[#8a6b41] font-light block"
            >
              View Hotel Facilities
            </button>
          </p>
        </div>
      </div>
      <div className="mt-20 md:mt-20 text-sm text-gray-500 font-light text-center">
        © Eightfold Group<br />2025, Official site
      </div>
    <HotelFacilityModal
      show={showFacilities}
      onClose={() => setShowFacilities(false)}
      propertyId={propertyId}
    />
    <HotelPolicyModal
      show={showPolicies}
      onClose={() => setShowPolicies(false)}
      propertyId={propertyId}
    />
    </footer>
  );
}
