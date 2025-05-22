import React from 'react';
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from '../contexts/AuthContext';

const tagLabelMap = {
  private: "Private",
  fullday: "Full Day",
  smallgroup: "Small Group",
  group: "Group",
  daytour: "Day Tour"
};

export default function TourDetailModal({ tour, onClose }) {
  const [currentImageIndex, setCurrentImageIndex] = React.useState(0);
  const [isBooking, setIsBooking] = React.useState(false);
  const containerRef = React.useRef(null);
  const { user } = useAuth();

  React.useEffect(() => {
    const handleClose = () => {
      setIsBooking(false);
      onClose();
    };
    window.addEventListener('closeAllModals', handleClose);
    return () => {
      window.removeEventListener('closeAllModals', handleClose);
    };
  }, [onClose]);
  if (!tour || !tour.imageUrls || tour.imageUrls.length === 0) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        <div className="text-white text-sm">Loading tour details…</div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex justify-center items-start md:items-center">
      <motion.div
        ref={containerRef}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 100 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        className="bg-white w-full max-h-[var(--app-height)] overflow-y-auto flex flex-col relative p-6 rounded-none md:rounded-lg shadow-lg md:max-w-6xl mx-auto"
      >
        <div className="flex-1 overflow-y-auto">
          <button
            onClick={onClose}
            className="absolute top-2 right-2 z-20 bg-white/40 backdrop-blur-sm rounded-full w-8 h-8 flex items-center justify-center text-xl text-gray-700 hover:text-black"
          >
            &times;
          </button>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left: Image slider */}
            <div>
              {tour.imageUrls?.length > 0 && (
                <div>
                  <div className="relative overflow-hidden bg-white">
                    <motion.img
                      key={currentImageIndex}
                      src={tour.imageUrls[currentImageIndex]}
                      alt="Tour"
                      loading="lazy"
                      className="w-full h-[420px] md:h-[470px] object-cover object-center rounded-xl shadow-md"
                      drag="x"
                      dragConstraints={{ left: 0, right: 0 }}
                      onDragEnd={(e, info) => {
                        if (info.offset.x > 50) {
                          setCurrentImageIndex((prev) => (prev - 1 + tour.imageUrls.length) % tour.imageUrls.length);
                        } else if (info.offset.x < -50) {
                          setCurrentImageIndex((prev) => (prev + 1) % tour.imageUrls.length);
                        }
                      }}
                      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    />
                    <button
                      onClick={() =>
                        setCurrentImageIndex(
                          (prev) => (prev - 1 + tour.imageUrls.length) % tour.imageUrls.length
                        )
                      }
                      className="absolute top-[220px] left-4 flex items-center justify-center bg-white/80 rounded-full w-10 h-10 text-black shadow-md ring-1 ring-black/10"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24">
                        <path stroke="#000" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 8l-4 4 4 4"/>
                      </svg>
                    </button>
                    <button
                      onClick={() =>
                        setCurrentImageIndex(
                          (prev) => (prev + 1) % tour.imageUrls.length
                        )
                      }
                      className="absolute top-[220px] right-4 flex items-center justify-center bg-white/80 rounded-full w-10 h-10 text-black shadow-md ring-1 ring-black/10"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24">
                        <path stroke="#000" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 8l4 4-4 4"/>
                      </svg>
                    </button>
                    <div className="flex gap-2 mt-2 justify-center">
                      {tour.imageUrls.map((img, i) => (
                        <button
                          key={i}
                          onClick={() => setCurrentImageIndex(i)}
                          className={`w-3 h-3 rounded-full ${i === currentImageIndex ? 'bg-gray-800' : 'bg-gray-300'} transition-all`}
                        />
                      ))}
                    </div>
                    <div className="flex mt-6 gap-3 overflow-x-auto justify-center px-2">
                      {tour.imageUrls.map((img, idx) => (
                        <img
                          key={idx}
                          src={img}
                          alt={`Thumbnail ${idx + 1}`}
                          loading="lazy"
                          className={`w-14 h-10 object-cover rounded cursor-pointer border ${currentImageIndex === idx ? 'border-blue-400' : 'border-transparent'}`}
                          onClick={() => setCurrentImageIndex(idx)}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Right: Tour details */}
            <div className="text-sm text-gray-700 space-y-4">

              <h2 className="text-4xl font-bold mb-1">{tour.title}</h2>
              

              <h2 className="text-xl font-bold"> {tour.category}</h2>

              {tour.tags && (
                <div className="mb-4 flex flex-wrap items-center gap-x-1.5 gap-y-1 text-sm text-gray-500 font-medium tracking-wide">
                  {tour.tags
                    .filter(tag =>
                      typeof tag === "string" &&
                      ["private", "fullday", "smallgroup", "group", "daytour"].includes(tag.toLowerCase())
                    )
                    .map((tag, index, arr) => (
                      <div key={index} className="flex items-center gap-x-1">
                        <span className="text-xs text-gray-500 tracking-wider">
                          {(tagLabelMap[tag.toLowerCase()] || tag).toUpperCase()}
                        </span>
                        {index < arr.length - 1 && (
                          <span className="text-gray-800 inline-block h-5 w-px bg-gray-400 mx-2 align-middle"></span>
                        )}
                      </div>
                    ))}
                </div>
              )}
              {tour.transportation?.allowChoice && tour.transportation?.availableTypes && (
                <div>
                  <strong>Price:</strong>
                  <ul className="list-disc ml-6 mt-1 text-gray-800 space-y-1">
                    {tour.transportation.availableTypes.map((type) => {
                      const key = type === "Tuk-Tuk" ? "tukTuk" : type.toLowerCase().replace(/[-\s]/g, '');
                      const label = type === "Tuk-Tuk" ? "Tuk-Tuk" : type;
                      let price = tour.transportation?.[key]?.price;

                      if (key === 'tukTuk') {
                        const p1 = tour.transportation?.tukTuk?.price1to2;
                        const p2 = tour.transportation?.tukTuk?.price3to4;
                        price = typeof p1 === "number" && p1 > 0 ? p1 : typeof p2 === "number" && p2 > 0 ? p2 : null;
                      }

                      if (typeof price === "number" && price > 0) {
                        return (
                          <li key={type} className="capitalize">
                            {label}: ${price}
                          </li>
                        );
                      }
                      return null;
                    })}
                  </ul>
                </div>
              )}
              <div><strong>Duration:</strong> {tour.duration}</div>

              {tour.tags?.length > 0 && (
                <div>
                  <strong className="block mb-1">Tags:</strong>
                  <div className="flex flex-wrap gap-2">
                    {tour.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="inline-block bg-gray-100 text-gray-700 text-xs font-medium px-3 py-1 rounded-full border border-gray-300"
                      >
                        {(tag || "").toUpperCase()}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <strong>Description:</strong>
                <p className="mt-1">{tour.description}</p>
                {tour.included && (
                  <div className="flex items-start gap-2 mt-2">
                    <svg viewBox="0 0 128 128" width="16" height="16" className="fill-green-600 mt-1">
                      <path d="M56.33 100a4 4 0 0 1-2.82-1.16L20.68 66.12a4 4 0 1 1 5.64-5.65l29.57 29.46 45.42-60.33a4 4 0 1 1 6.38 4.8l-48.17 64a4 4 0 0 1-2.91 1.6z"></path>
                    </svg>
                    <span><strong>Included:</strong> {tour.included}</span>
                  </div>
                )}
                {tour.notIncluded && (
                  <div className="flex items-start gap-2 mt-2">
                    <svg viewBox="0 0 24 24" width="16" height="16" className="fill-red-500 mt-1">
                      <path d="M18.36 5.64a1 1 0 0 0-1.41 0L12 10.59 7.05 5.64a1 1 0 1 0-1.41 1.41L10.59 12l-4.95 4.95a1 1 0 0 0 1.41 1.41L12 13.41l4.95 4.95a1 1 0 0 0 1.41-1.41L13.41 12l4.95-4.95a1 1 0 0 0 0-1.41z"/>
                    </svg>
                    <span><strong>Not Included:</strong> {tour.notIncluded}</span>
                  </div>
                )}
              </div>

              {tour.availableHours?.from && tour.availableHours?.to && (
                <div>
                  <strong>Available:</strong> {tour.availableHours.from} – {tour.availableHours.to}
                </div>
              )}

              {tour.location && (
                <div>
                  <strong>Location:</strong> {tour.location}
                </div>
              )}

              

             

              {tour.speakerOrHost && (
                <div>
                  <strong>Host:</strong> {tour.speakerOrHost}
                </div>
              )}
            </div>
          </div>
        </div>
        {/*
        <div className="mt-4 pt-4 border-t border-gray-200 flex justify-center">
          <motion.button
            whileTap={{ scale: 0.96 }}
            className="bg-black text-white text-m font-light px-8 py-4 w-full max-w-xs"
            onClick={() => setIsBooking(true)}
          >
            Book this tour
          </motion.button>
        </div>
        */}
      </motion.div>
      <AnimatePresence>
        {isBooking && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            transition={{ duration: 0.25 }}
          >
            <TourBookingModal
              tour={tour}
              title={tour.category}
              onClose={() => setIsBooking(false)}
              user={user}
              included={tour.included}
              notIncluded={tour.notIncluded}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}