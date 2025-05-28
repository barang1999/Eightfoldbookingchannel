import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useClickOutside } from "../hooks/useClickOutside";
import ReviewModal from "./ReviewModal";
import MapModal from "./MapModal";
import { AnimatePresence, motion } from "framer-motion";

const SkeletonBlock = ({ className }) => (
  <motion.div
    className={`bg-gray-200 rounded ${className}`}
    initial={{ backgroundPosition: '100% 0' }}
    animate={{ backgroundPosition: '-100% 0' }}
    transition={{ repeat: Infinity, duration: 1.2, ease: 'linear' }}
    style={{
      backgroundImage: 'linear-gradient(90deg, #e5e7eb 25%, #f3f4f6 50%, #e5e7eb 75%)',
      backgroundSize: '200% 100%',
    }}
  />
);

const HotelProfile = ({ propertyId }) => {
  const [property, setProperty] = useState(null);
  const [showMapModal, setShowMapModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);

  useEffect(() => {
    if (!propertyId) return;
    axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/property?propertyId=${propertyId}`)
      .then(res => setProperty(res.data))
      .catch(err => console.error("Failed to fetch property:", err));
  }, [propertyId]);

  if (!property) {
    return (
      <section className="bg-white px-6 py-6 shadow-sm rounded-xl mb-6 space-y-4">
        <SkeletonBlock className="h-6 w-1/3" />
        <SkeletonBlock className="h-4 w-1/2" />
        <SkeletonBlock className="h-4 w-1/4" />
      </section>
    );
  }

  return (
    <>
      <section className="bg-white px-6 py-6 shadow-sm rounded-xl mb-6">
        <h2 className="text-2xl font-bold text-gray-800">
          <a
            href={property.socialLinks?.website}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline"
          >
            {property.name}
          </a>
        </h2>
        {property.socialLinks?.website && (
          <div className="text-sm mt-1">
            <a
              href={property.socialLinks.website}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline"
              style={{ color: '#A58E63' }}
            >
              Visit hotel website
            </a>
          </div>
        )}

        <div className="mt-2 text-sm text-gray-600">
          Resorts {property.hotelStarRating} {"★".repeat(property.hotelStarRating)} | <span
            onClick={() => setShowReviewModal(true)}
            className="text-blue-700 underline cursor-pointer"
          >
            See reviews
          </span>
        </div>
        <div className="mt-1 text-sm text-gray-500">
          {property.address} — <a
            onClick={() => setShowMapModal(true)}
            className="text-blue-700 underline cursor-pointer"
          >
            See on the map
          </a>
        </div>
      </section>
      <MapModal
        isOpen={showMapModal}
        onClose={() => setShowMapModal(false)}
        embedHtml={property.googleMapEmbed}
      />
      {showReviewModal && (
        <ReviewModal
          propertyId={propertyId}
          propertyName={property.name}
          onClose={() => setShowReviewModal(false)}
        />
      )}
    </>
  );
};

export default HotelProfile;