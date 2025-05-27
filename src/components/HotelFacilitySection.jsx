import React, { useEffect, useState, useRef } from 'react';
import { motion } from "framer-motion";
import { useClickOutside } from '../hooks/useClickOutside';
import {
  BedDouble, Bath, Utensils, Wifi, Tv, ConciergeBell, Dumbbell, KeyRound, Sparkles,
  Binoculars, UtensilsCrossed, Car, ShieldCheck, Droplet, Languages, Layout, Brush, ShieldAlert, Waves, Flower2
} from 'lucide-react';

const iconMap = {
  Bedroom: BedDouble,
  Bathroom: Bath,
  Kitchen: Utensils,
  Internet: Wifi,
  'Media & Technology': Tv,
  'Front Desk Services': ConciergeBell,
  Activities: Dumbbell,
  'Room Amenities': KeyRound,
  'Cleaning Services': Droplet,
  'View': Binoculars,
  'Food & Drink': UtensilsCrossed,
  'Living Area': Layout,
  Parking: Car,
  'Safety & security': ShieldAlert,
  'Outdoor swimming pool': Waves,
  Spa: Flower2,
  'Languages Spoken': Languages
};

const HotelFacilityModal = ({ show, onClose, propertyId }) => {
  const [facilities, setFacilities] = useState([]);
  const modalRef = useRef();
  useClickOutside(modalRef, onClose);

  useEffect(() => {
    if (!show || !propertyId) return;
    const fetchFacilities = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/facilities/${propertyId}`);
        const data = await res.json();
        setFacilities(data);
      } catch (err) {
        console.error("❌ Failed to fetch hotel facilities:", err);
      }
    };
    fetchFacilities();
  }, [propertyId, show]);

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <motion.div
        ref={modalRef}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.3 }}
        className="bg-white rounded-lg shadow-lg w-full h-full sm:h-[95vh] sm:max-w-4xl p-6 overflow-y-auto relative mx-0 sm:mx-6 md:mx-auto"
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-black text-2xl">&times;</button>
        <h2 className="text-3xl font-serif text-center pb-7 text-[#8a6b41]">Hotel Facilities</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-12 px-6">
          {facilities.map((facility) => {
            const Icon = iconMap[facility.category] || Sparkles;
            return (
              <div key={facility._id} className="text-center space-y-4">
                <Icon className="mx-auto h-8 w-8" strokeWidth={1.2} style={{ color: '#A58E63' }} />
                <h3 className="text-lg font-medium text-gray-800">{facility.category}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {facility.items.join(', ')}
                </p>
              </div>
            );
          })}
        </div>
        <div className="mt-8 flex justify-center">
          <button
            onClick={onClose}
            className="px-6 py-2 text-sm border border-gray-300 rounded text-gray-600 hover:border-gray-400 hover:text-black"
          >
            Close
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default HotelFacilityModal;