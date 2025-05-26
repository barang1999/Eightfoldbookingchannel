import React, { useEffect, useState } from 'react';
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

const HotelFacilitySection = ({ propertyId }) => {
  const [facilities, setFacilities] = useState([]);

  useEffect(() => {
    if (!propertyId) return;

    const fetchFacilities = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_ADMIN_API_URL}/api/facilities/${propertyId}`);
        const data = await res.json();
        setFacilities(data);
      } catch (err) {
        console.error("❌ Failed to fetch hotel facilities:", err);
      }
    };

    fetchFacilities();
  }, [propertyId]);

  if (!facilities.length) return null;

  return (
    <section className="py-16 bg-white">
    <h2 className="text-3xl font-serif text-center pb-7 text-[#8a6b41]">Hotel Facilities</h2> 
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-12 px-6 max-w-6xl mx-auto">
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
    </section>
  );
};

export default HotelFacilitySection;