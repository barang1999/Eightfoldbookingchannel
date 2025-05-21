import React, { useRef } from 'react';
import { useClickOutside } from '../hooks/useClickOutside';
import { motion, AnimatePresence } from 'framer-motion';

export default function TourDetailModal({ tour, onClose }) {
  const [currentImageIndex, setCurrentImageIndex] = React.useState(0);
  const containerRef = React.useRef(null);
  const modalRef = useRef(null);
  useClickOutside(modalRef, onClose);
  if (!tour) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black bg-opacity-50 flex justify-center items-center md:items-center md:justify-center"
      >
        <motion.div
          ref={modalRef}
          initial={{ y: typeof window !== 'undefined' && window.innerWidth < 768 ? 100 : 0, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: typeof window !== 'undefined' && window.innerWidth < 768 ? 100 : 0, opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="bg-white w-full h-full md:h-auto md:max-h-[95vh] md:max-w-5xl md:rounded-lg overflow-y-auto relative p-4 md:p-6 shadow-lg"
        >
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
                <div ref={containerRef}>
                  <div className="relative overflow-hidden bg-white">
                    <img
                      src={tour.imageUrls[currentImageIndex]}
                      alt="Tour"
                      className="w-full h-[220px] md:h-[470px] object-cover object-center rounded-xl shadow-md"
                    />
                    <button
                      onClick={() =>
                        setCurrentImageIndex(
                          (prev) => (prev - 1 + tour.imageUrls.length) % tour.imageUrls.length
                        )
                      }
                      className="absolute top-[90px] md:top-[220px] left-4 flex items-center justify-center bg-white/80 rounded-full w-10 h-10 text-black shadow-md ring-1 ring-black/10"
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
                      className="absolute top-[90px] md:top-[220px] right-4 flex items-center justify-center bg-white/80 rounded-full w-10 h-10 text-black shadow-md ring-1 ring-black/10"
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
                    <div className="flex mt-2 gap-3 overflow-x-auto justify-center px-2">
                      {tour.imageUrls.map((img, idx) => (
                        <img
                          key={idx}
                          src={img}
                          alt={`Thumbnail ${idx + 1}`}
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
              <h2 className="text-4xl font-bold mb-2">{tour.title}</h2>

              <div className="ext-2xl font-bold"> {tour.category}</div>
              {tour.transportation?.allowChoice && tour.transportation?.availableTypes?.length > 0 && (
                <div>
                  <strong>Price:</strong>
                  <ul className="list-disc ml-6 mt-1 text-gray-800">
                    {tour.transportation.availableTypes.map((type) => {
                      const keyMap = { 'Tuk-Tuk': 'tukTuk', 'Car': 'car', 'Van': 'van' };
                      const key = keyMap[type] || type.toLowerCase().replace(/[-\s]/g, '');
                      const label = type.charAt(0).toUpperCase() + type.slice(1);
                      const transportOption = tour.transportation[key];

                      if (!transportOption) return null;

                      let price = null;
                      if (key === 'tukTuk' || key === 'tuktuk') {
                        price = transportOption?.price1to2 ?? transportOption?.price3to4 ?? transportOption?.price;
                      } else if (key === 'car') {
                        price = transportOption?.price1to4 ?? transportOption?.van5to8 ?? transportOption?.price;
                      } else {
                        price = transportOption?.price;
                      }

                      if (price !== undefined && price !== null) {
                        return <li key={key}>{label}: ${price}</li>;
                      }
                      return null;
                    })}
                  </ul>
                </div>
              )}
              <div><strong>Duration:</strong> {tour.duration}</div>

              {tour.tags?.length > 0 && (
                <div>
                  <strong>Tags:</strong>{' '}
                  <span className="inline-block">{tour.tags.join(', ')}</span>
                </div>
              )}

              <div>
                <strong>Description:</strong>
                <div className="mt-1 text-gray-800 whitespace-pre-line space-y-1">
                  {tour.description.split('\n').map((line, index) => {
                    const trimmed = line.trim();
                    if (trimmed.toLowerCase().startsWith('included:')) {
                      return (
                        <div key={index} className="flex items-start gap-2">
                          <svg viewBox="0 0 128 128" width="16" height="16" className="fill-green-600 mt-1">
                            <path d="M56.33 100a4 4 0 0 1-2.82-1.16L20.68 66.12a4 4 0 1 1 5.64-5.65l29.57 29.46 45.42-60.33a4 4 0 1 1 6.38 4.8l-48.17 64a4 4 0 0 1-2.91 1.6z"></path>
                          </svg>
                          <span>
                            <strong>{trimmed.split(':')[0]}:</strong>{trimmed.substring(trimmed.indexOf(':') + 1)}
                          </span>
                        </div>
                      );
                    } else if (trimmed.toLowerCase().startsWith('not included:')) {
                      return (
                        <div key={index} className="flex items-start gap-2">
                          <svg viewBox="0 0 24 24" width="16" height="16" className="fill-red-500 mt-1">
                            <path d="M18.36 5.64a1 1 0 0 0-1.41 0L12 10.59 7.05 5.64a1 1 0 1 0-1.41 1.41L10.59 12l-4.95 4.95a1 1 0 0 0 1.41 1.41L12 13.41l4.95 4.95a1 1 0 0 0 1.41-1.41L13.41 12l4.95-4.95a1 1 0 0 0 0-1.41z"/>
                          </svg>
                          <span>
                            <strong>{trimmed.split(':')[0]}:</strong>{trimmed.substring(trimmed.indexOf(':') + 1)}
                          </span>
                        </div>
                      );
                    } else {
                      return <p key={index}>{trimmed}</p>;
                    }
                  })}
                </div>
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

        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}