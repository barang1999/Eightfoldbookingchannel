import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useClickOutside } from "../hooks/useClickOutside";
import ReviewModal from "./ReviewModal";
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
  const mapModalRef = useRef(null);

  useClickOutside(mapModalRef, () => setShowMapModal(false));

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
        <h2 className="text-2xl font-bold text-gray-800">{property.name}</h2>

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
      <AnimatePresence>
        {showMapModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center"
          >
            <div
              ref={mapModalRef}
              className="bg-white rounded-2xl w-full max-w-screen-xl mx-6 p-6 shadow-xl relative transition-all duration-300"
            >
              <button
                onClick={() => setShowMapModal(false)}
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 text-xl font-semibold"
              >
                &times;
              </button>
              <div className="rounded-lg overflow-hidden shadow-inner border border-gray-200 w-full h-[650px]">
                <iframe
                  src={property.googleMapEmbed?.match(/src="([^"]+)"/)?.[1] || ""}
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="w-full h-full"
                ></iframe>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
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