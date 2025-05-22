import React, { useRef, useEffect } from 'react';
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { useClickOutside } from "../hooks/useClickOutside";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";

export default function RoomDetailModal({ room, onClose }) {
  const [currentImageIndex, setCurrentImageIndex] = React.useState(0);
  const { t } = useTranslation("translation");
  const containerRef = useRef(null);
  const startX = useRef(0);
  useClickOutside(containerRef, onClose);
  useEffect(() => {
    const handleTouchStart = (e) => {
      startX.current = e.touches[0].clientX;
    };
    const handleTouchEnd = (e) => {
      const endX = e.changedTouches[0].clientX;
      const diffX = endX - startX.current;
      if (Math.abs(diffX) > 50) {
        if (diffX < 0) {
          setCurrentImageIndex((prev) => (prev + 1) % room.images.length);
        } else {
          setCurrentImageIndex((prev) => (prev - 1 + room.images.length) % room.images.length);
        }
      }
    };
    const container = containerRef.current;
    if (container) {
      container.addEventListener('touchstart', handleTouchStart);
      container.addEventListener('touchend', handleTouchEnd);
    }
    return () => {
      if (container) {
        container.removeEventListener('touchstart', handleTouchStart);
        container.removeEventListener('touchend', handleTouchEnd);
      }
    };
  }, [room.images.length]);
  if (!room) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black bg-opacity-50 flex justify-center items-center"
    >
      <div ref={containerRef} className="bg-white max-w-6xl w-full max-h-[95vh] overflow-y-auto relative p-6">
      <button
  onClick={onClose}
  className="absolute top-2 right-2 z-20 bg-white/40 backdrop-blur-sm rounded-full w-8 h-8 flex items-center justify-center text-xl text-gray-700 hover:text-black"
>
  &times;
</button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left: Image slideshow */}
          <div>
            {room.images?.length > 0 && (
              <div>
                <div className="relative overflow-hidden bg-white">
                  <img
                    src={room.images[currentImageIndex]}
                    alt="Room"
                    className="w-full h-[420px] md:h-[470px] object-cover object-center rounded-xl shadow-md"
                  />
                  <button
                    onClick={() =>
                      setCurrentImageIndex(
                        (prev) => (prev - 1 + room.images.length) % room.images.length
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
                        (prev) => (prev + 1) % room.images.length
                      )
                    }
                    className="absolute top-[220px] right-4 flex items-center justify-center bg-white/80 rounded-full w-10 h-10 text-black shadow-md ring-1 ring-black/10"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24">
                      <path stroke="#000" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 8l4 4-4 4"/>
                    </svg>
                  </button>
                  <div className="flex gap-2 mt-2 justify-center">
                    {room.images.map((img, i) => (
                      <button
                        key={i}
                        onClick={() => setCurrentImageIndex(i)}
                        className={`w-3 h-3 rounded-full ${i === currentImageIndex ? 'bg-gray-800' : 'bg-gray-300'} transition-all`}
                      />
                    ))}
                  </div>
                  <div className="flex mt-6 gap-3 overflow-x-auto justify-center px-2">
                    {room.images.map((img, idx) => (
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

          {/* Right: Details */}
          <div className="text-sm text-gray-700 space-y-4">

          <h2 className="text-2xl font-bold mb-4">{t(`roomTypes.${room.roomType}`, room.roomType)}</h2>

          {room.roomFeatures?.length > 0 && (
              <div>
                <strong>{t("roomDetails.featuresTitle", "Room Features")}</strong>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2 text-sm text-gray-800">
                  {(() => {
                    const svgIcons = {
                      '80 m²': <svg viewBox="0 0 24 24" width="16" height="16"><path d="M3.75 23.25V7.5a.75.75 0 0 0-1.5 0v15.75a.75.75 0 0 0 1.5 0..."/></svg>,
                      'Balcony': (
                        <svg viewBox="0 0 24 24" width="16" height="16">
                          <path d="m.768 11.413 1.5 6.75a.75.75 0 0 0 1.464-.326l-1.5-6.75a.75.75 0 0 0-1.464.326M2.22 23.456l1.5-5.25-.72.544h3a.75.75 0 0 1 .75.75v3.75a.75.75 0 0 0 1.5 0V19.5A2.25 2.25 0 0 0 6 17.25H3a.75.75 0 0 0-.721.544l-1.5 5.25a.75.75 0 1 0 1.442.412zm19.547-12.369-1.5 6.75a.75.75 0 1 0 1.464.326l1.5-6.75a.75.75 0 1 0-1.464-.326m1.453 11.957-1.5-5.25a.75.75 0 0 0-.72-.544h-3a2.25 2.25 0 0 0-2.25 2.25v3.75a.75.75 0 0 0 1.5 0V19.5a.75.75 0 0 1 .75-.75h3l-.721-.544 1.5 5.25a.75.75 0 1 0 1.442-.412zM11.25 6.75v16.5a.75.75 0 0 0 1.5 0V6.75a.75.75 0 0 0-1.5 0m-4.5 7.5h10.5a.75.75 0 0 0 0-1.5H6.75a.75.75 0 0 0 0 1.5M1.5 6l10.064-4.37c.297-.161.575-.161.803-.033l10.178 4.425L22.5 6zm0 1.5h21a1.5 1.5 0 0 0 .689-2.832L13.034.255c-.616-.35-1.452-.35-2.136.034L.858 4.646c-.544.28-.856.792-.857 1.352A1.5 1.5 0 0 0 1.499 7.5z"/>
                        </svg>
                      ),
                      'Pool View': (
                        <svg viewBox="0 0 24 24" width="16" height="16">
<path d="M23.097 21.71c-.896.187-1.71-.114-2.442-.76a4.6 4.6 0 0 1-.74-.837.75.75 0 0 0-1.272-.004 3.56 3.56 0 0 1-2.925 1.661 2.98 2.98 0 0 1-2.559-1.608.75.75 0 0 0-1.26-.11 4.42 4.42 0 0 1-3.286 1.719c-1.121-.058-2.216-.68-2.876-1.677a.75.75 0 0 0-1.214-.05 6.2 6.2 0 0 1-1.125 1.033c-.833.588-1.677.85-2.49.675a.75.75 0 1 0-.315 1.466c1.285.276 2.526-.107 3.67-.915a7 7 0 0 0 1.438-1.33l-1.214-.05a5.26 5.26 0 0 0 4.126 2.346c1.807-.084 3.417-.926 4.476-2.303l-1.26-.11a4.49 4.49 0 0 0 3.892 2.414 5.07 5.07 0 0 0 4.192-2.361l-1.272-.004c.192.308.533.739 1.022 1.17 1.057.931 2.32 1.4 3.74 1.104a.75.75 0 0 0-.306-1.468zm0-4.5c-.896.187-1.71-.114-2.442-.76a4.6 4.6 0 0 1-.74-.837.75.75 0 0 0-1.272-.004 3.56 3.56 0 0 1-2.925 1.661 2.98 2.98 0 0 1-2.559-1.608.75.75 0 0 0-1.26-.11 4.42 4.42 0 0 1-3.286 1.719c-1.121-.058-2.216-.68-2.876-1.677a.75.75 0 0 0-1.214-.05 6.2 6.2 0 0 1-1.125 1.033c-.833.588-1.677.85-2.49.675a.75.75 0 1 0-.315 1.466c1.285.276 2.526-.107 3.67-.915a7 7 0 0 0 1.438-1.33l-1.214-.05a5.26 5.26 0 0 0 4.126 2.346c1.807-.084 3.417-.926 4.476-2.303l-1.26-.11a4.49 4.49 0 0 0 3.892 2.414 5.07 5.07 0 0 0 4.192-2.361l-1.272-.004c.192.308.533.739 1.022 1.17 1.057.931 2.32 1.4 3.74 1.104a.75.75 0 0 0-.306-1.468zm-1.722-8.64a1.875 1.875 0 1 1-3.75 0 1.875 1.875 0 0 1 3.75 0m1.5 0a3.375 3.375 0 1 0-6.75 0 3.375 3.375 0 0 0 6.75 0M7.777 14.636l3.831-2.4a.75.75 0 0 0 .166-1.13L8.964 7.9a2.25 2.25 0 0 1 .687-3.494l4.264-2.135a.751.751 0 1 1 .686 1.333l-.01.006-3.405 1.702a1.502 1.502 0 0 0-.448 2.334l5.375 6.142a.75.75 0 1 0 1.128-.988l-5.377-6.145-.002-.003v-.001l3.394-1.697.027-.013A2.25 2.25 0 0 0 13.238.93L8.98 3.065a3.75 3.75 0 0 0-1.144 5.824l2.81 3.206.166-1.13-3.831 2.4a.75.75 0 0 0 .796 1.272z"></path>                        </svg>
                      ),
                      'Garden view': (
                        <svg viewBox="0 0 24 24" width="16" height="16">
                          <path d="M5.361 6.625a6.75 6.75 0 0 0 7.413 6.721 6.93 6.93 0 0 0 6.087-6.988V2.125a1.5 1.5 0 0 0-2.4-1.2l-1.8 1.35h.9L13.461.7c-.8-.6-1.9-.6-2.7 0l-2.1 1.575h.9l-1.8-1.35a1.5 1.5 0 0 0-2.4 1.2zm1.5 0v-4.5l1.8 1.35c.267.2.633.2.9 0l2.1-1.575a.75.75 0 0 1 .9 0l2.1 1.575c.267.2.633.2.9 0l1.8-1.35V6.37a5.43 5.43 0 0 1-4.754 5.486 5.25 5.25 0 0 1-5.746-5.23zm4.5 6v10.5a.75.75 0 0 0 1.5 0v-10.5a.75.75 0 0 0-1.5 0m-5.359 3.811c1.473.285 2.458 1.077 2.374 1.51-.084.432-1.292.801-2.765.516-1.473-.284-2.458-1.076-2.374-1.51.084-.432 1.292-.8 2.765-.516m.285-1.473c-2.179-.42-4.233.206-4.523 1.705s1.383 2.846 3.562 3.267 4.233-.205 4.523-1.705-1.383-2.846-3.562-3.267m14.699 2.09c.084.434-.9 1.226-2.374 1.51-1.473.285-2.681-.084-2.765-.516-.084-.433.9-1.226 2.374-1.51 1.473-.285 2.681.084 2.765.517zm1.473-.284c-.29-1.5-2.344-2.126-4.523-1.705s-3.851 1.767-3.562 3.267 2.344 2.126 4.523 1.705 3.852-1.767 3.562-3.267"/>
                        </svg>
                      ),
                      'Landmark view': (
                        <svg viewBox="0 0 24 24" width="16" height="16">
                          <path d="M4.5 8.911h3l-.75-.75v9l.75-.75h-3l.75.75v-9zm0-1.5a.75.75 0 0 0-.75.75v9c0 .414.336.75.75.75h3a.75.75 0 0 0 .75-.75v-9a.75.75 0 0 0-.75-.75zm6 1.5h3l-.75-.75v9l.75-.75h-3l.75.75v-9zm0-1.5a.75.75 0 0 0-.75.75v9c0 .414.336.75.75.75h3a.75.75 0 0 0 .75-.75v-9a.75.75 0 0 0-.75-.75zm6 1.5h3l-.75-.75v9l.75-.75h-3l.75.75v-9zm0-1.5a.75.75 0 0 0-.75.75v9c0 .414.336.75.75.75h3a.75.75 0 0 0 .75-.75v-9a.75.75 0 0 0-.75-.75zm4.5 12H3l.75.75v-2.25h16.5v2.25zm0 1.5a.75.75 0 0 0 .75-.75v-2.25a1.5 1.5 0 0 0-1.5-1.5H3.75a1.5 1.5 0 0 0-1.5 1.5v2.25c0 .414.336.75.75.75zm-19.5 3h21a.75.75 0 0 0 0-1.5h-21a.75.75 0 0 0 0 1.5m0-3h21a.75.75 0 0 0 0-1.5h-21a.75.75 0 0 0 0 1.5m18.75-15.75v2.25H3.75v-2.25l-.415.67L12 1.5l8.665 4.332zm1.5 0a.75.75 0 0 0-.415-.67L12.67.157a1.5 1.5 0 0 0-1.34 0L2.666 4.49a.75.75 0 0 0-.415.671v2.25a1.5 1.5 0 0 0 1.5 1.5h16.5a1.5 1.5 0 0 0 1.5-1.5v-2.25zM3 5.911h18a.75.75 0 0 0 0-1.5H3a.75.75 0 0 0 0 1.5"/>
                        </svg>
                      ),
                      'Inner courtyard view': <svg viewBox="0 0 24 24" width="16" height="16"><path d="M23.25 11.248a5.99 5.99 0 0 0-3.486-5.43l.423.82a3.704 3.704 0 0 0-3.699-4.388 1 1 0 0 0-.184.015l-.016.002c-.029.004-.024.004-.02.004l.047.748.618-.425a5.987 5.987 0 0 0-9.866 0l.618.425.048-.748c.003 0 .007 0-.021-.004l-.016-.002A1.3 1.3 0 0 0 7.5 2.25a3.7 3.7 0 0 0-3.687 4.389L4.55 6.5l-.313-.681a5.989 5.989 0 0 0 1.264 11.3l-.526-.419a4.832 4.832 0 0 0 7.51 1.654L12 17.782l-.485.572a4.832 4.832 0 0 0 7.51-1.657l-.681-.315.156.734a6 6 0 0 0 4.75-5.866zm-1.5.002a4.5 4.5 0 0 1-3.562 4.398.75.75 0 0 0-.525.42 3.333 3.333 0 0 1-5.178 1.142.75.75 0 0 0-.97 0 3.332 3.332 0 0 1-5.179-1.14.75.75 0 0 0-.525-.419 4.489 4.489 0 0 1-.947-8.47.75.75 0 0 0 .423-.82A2.204 2.204 0 0 1 7.488 3.75h.001l.012.003c.05.007.089.011.136.014a.75.75 0 0 0 .666-.323 4.487 4.487 0 0 1 7.394 0 .75.75 0 0 0 .666.323c.047-.003.087-.007.136-.014l.012-.002q.012-.001-.011-.001a2.204 2.204 0 0 1 2.213 2.611.75.75 0 0 0 .424.82 4.49 4.49 0 0 1 2.613 4.07zm-10.5-3v15a.75.75 0 0 0 1.5 0v-15a.75.75 0 0 0-1.5 0m.75 7.5c3.414 0 5.25-1.836 5.25-5.25a.75.75 0 0 0-1.5 0c0 2.586-1.164 3.75-3.75 3.75a.75.75 0 0 0 0 1.5m-.045-4.499a2.793 2.793 0 0 1-2.956-2.956.75.75 0 0 0-1.498-.09 4.295 4.295 0 0 0 4.544 4.544.75.75 0 1 0-.09-1.498"></path></svg>,
                      'Air conditioning': <svg viewBox="0 0 24 24" width="16" height="16"><path d="M11.25.75v7.5a.75.75 0 0 0 1.5 0V.75a.75.75 0 0 0-1.5 0m4.031.914-3.75 3h.938l-3.75-3a.75.75 0 1 0-.938 1.172l3.75 3a.75.75 0 0 0 .938 0l3.75-3a.75.75 0 1 0-.938-1.172M1.883 7.024l6.495 3.75a.75.75 0 0 0 .75-1.299l-6.495-3.75a.75.75 0 1 0-.75 1.3zM4.69 3.99l.723 4.748.468-.812-4.473 1.748a.75.75 0 0 0 .546 1.398l4.473-1.748a.75.75 0 0 0 .468-.812l-.723-4.748a.75.75 0 1 0-1.482.226M2.632 18.274l6.495-3.75a.75.75 0 1 0-.75-1.298l-6.495 3.75a.75.75 0 1 0 .75 1.299zm-1.224-3.948 4.473 1.748-.468-.812-.723 4.748a.75.75 0 0 0 1.482.226l.723-4.748a.75.75 0 0 0-.468-.812l-4.473-1.748a.75.75 0 0 0-.546 1.398M12.75 23.25v-7.5a.75.75 0 0 0-1.5 0v7.5a.75.75 0 0 0 1.5 0m-4.031-.914 3.75-3h-.938l3.75 3a.75.75 0 0 0 .937-1.172l-3.75-3a.75.75 0 0 0-.937 0l-3.75 3a.75.75 0 0 0 .938 1.172m13.399-5.36-6.495-3.75a.75.75 0 0 0-.75 1.298l6.495 3.75a.75.75 0 0 0 .75-1.299zm-2.807 3.034-.724-4.748-.468.812 4.473-1.748a.75.75 0 0 0-.546-1.398l-4.473 1.748a.75.75 0 0 0-.468.812l.723 4.748a.75.75 0 0 0 1.483-.226m2.057-14.285-6.495 3.75a.75.75 0 0 0 .75 1.3l6.495-3.75a.75.75 0 0 0-.75-1.3m1.224 3.95-4.473-1.749.468.812.724-4.748a.75.75 0 0 0-1.483-.226l-.723 4.748a.75.75 0 0 0 .468.812l4.473 1.748a.75.75 0 0 0 .546-1.398zM11.625 7.6 8.377 9.475a.75.75 0 0 0-.375.65v3.75a.75.75 0 0 0 .375.65l3.248 1.874a.75.75 0 0 0 .75 0l3.248-1.875a.75.75 0 0 0 .375-.649v-3.75a.75.75 0 0 0-.375-.65L12.375 7.6a.75.75 0 0 0-.75 0m.75 1.3h-.75l3.248 1.874-.375-.649v3.75l.375-.65-3.248 1.876h.75l-3.248-1.876.375.65v-3.75l-.375.65z"></path></svg>,
                      'Spa bath': <svg viewBox="0 0 24 24" width="16" height="16"><path d="M12.75 15h10.5l-.74-.873-.664 3.986a5.25 5.25 0 0 1-5.179 4.387H7.333a5.25 5.25 0 0 1-5.18-4.387l-.663-3.986L.75 15h4.5a.75.75 0 0 0 0-1.5H.75a.75.75 0 0 0-.74.873l.664 3.986A6.75 6.75 0 0 0 7.334 24h9.333a6.75 6.75 0 0 0 6.659-5.64l.664-3.987a.75.75 0 0 0-.74-.873h-10.5a.75.75 0 0 0 0 1.5M12 19.5H6v-5.25a.75.75 0 0 1 .75-.75h4.5a.75.75 0 0 1 .75.75zm0 1.5a1.5 1.5 0 0 0 1.5-1.5v-5.25A2.25 2.25 0 0 0 11.25 12h-4.5a2.25 2.25 0 0 0-2.25 2.25v5.25A1.5 1.5 0 0 0 6 21zm4.5-17.25a2.25 2.25 0 0 1 4.5 0v10.5a.75.75 0 0 0 1.5 0V3.75a3.75 3.75 0 1 0-7.5 0 .75.75 0 0 0 1.5 0m-3 3a2.25 2.25 0 0 1 4.5 0l.75-.75h-6zm-1.5 0c0 .414.336.75.75.75h6a.75.75 0 0 0 .75-.75 3.75 3.75 0 1 0-7.5 0"></path></svg>,
                      'Patio': <svg viewBox="0 0 24 24" width="16" height="16"><path d="m.768 11.413 1.5 6.75a.75.75 0 0 0 1.464-.326l-1.5-6.75a.75.75 0 0 0-1.464.326M2.22 23.456l1.5-5.25-.72.544h3a.75.75 0 0 1 .75.75v3.75a.75.75 0 0 0 1.5 0V19.5A2.25 2.25 0 0 0 6 17.25H3a.75.75 0 0 0-.721.544l-1.5 5.25a.75.75 0 1 0 1.442.412zm19.547-12.369-1.5 6.75a.75.75 0 1 0 1.464.326l1.5-6.75a.75.75 0 1 0-1.464-.326m1.453 11.957-1.5-5.25a.75.75 0 0 0-.72-.544h-3a2.25 2.25 0 0 0-2.25 2.25v3.75a.75.75 0 0 0 1.5 0V19.5a.75.75 0 0 1 .75-.75h3l-.721-.544 1.5 5.25a.75.75 0 1 0 1.442-.412zM11.25 6.75v16.5a.75.75 0 0 0 1.5 0V6.75a.75.75 0 0 0-1.5 0m-4.5 7.5h10.5a.75.75 0 0 0 0-1.5H6.75a.75.75 0 0 0 0 1.5M1.5 6l10.064-4.37c.297-.161.575-.161.803-.033l10.178 4.425L22.5 6zm0 1.5h21a1.5 1.5 0 0 0 .689-2.832L13.034.255c-.616-.35-1.452-.35-2.136.034L.858 4.646c-.544.28-.856.792-.857 1.352A1.5 1.5 0 0 0 1.499 7.5z"></path></svg>,
                      'Private bathroom': <svg viewBox="0 0 24 24" width="16" height="16"><path d="M15.375 10.875a1.875 1.875 0 1 1-3.75 0 1.875 1.875 0 0 1 3.75 0m1.5 0a3.375 3.375 0 1 0-6.75 0 3.375 3.375 0 0 0 6.75 0m.375 12.375V18.7l-.667.745C20.748 18.98 24 15.925 24 10.5a2.25 2.25 0 0 0-4.5 0c0 1.945-.609 3.154-1.64 3.848a3.97 3.97 0 0 1-2.132.652H9a3.75 3.75 0 1 0 0 7.5h3a2.25 2.25 0 0 0 0-4.5H9a.75.75 0 0 0 0 1.5h3a.75.75 0 0 1 0 1.5H9a2.25 2.25 0 0 1 0-4.5h6.74a5.43 5.43 0 0 0 2.957-.908C20.154 14.613 21 12.932 21 10.5a.75.75 0 0 1 1.5 0c0 4.6-2.628 7.069-6.083 7.455a.75.75 0 0 0-.667.745v4.55a.75.75 0 0 0 1.5 0m-7.5-1.5v1.5a.75.75 0 0 0 1.5 0v-1.5a.75.75 0 0 0-1.5 0M.75 1.5h1.5l-.53-.22 1.402 1.402a.75.75 0 0 0 1.06-1.06L2.78.22A.75.75 0 0 0 2.25 0H.75a.75.75 0 1 0 0 1.5m2.983 3.754a.01.01 0 0 1 .016.002c-.542-1.072-.1-2.426 1.008-2.988a2.25 2.25 0 0 1 2.037 0c-.041-.022-.043-.029-.04-.034l.002-.002-3.013 3.012zm1.07 1.05 3.002-3A1.49 1.49 0 0 0 7.51.951 3.77 3.77 0 0 0 4.079.929 3.75 3.75 0 0 0 2.43 5.971a1.49 1.49 0 0 0 2.382.323zm3.408-.968 1.116.62a.75.75 0 1 0 .728-1.312l-1.116-.62a.75.75 0 1 0-.728 1.312m1.964-2.233 1.615.44a.75.75 0 1 0 .394-1.448l-1.615-.44a.75.75 0 1 0-.394 1.448m4.217 1.15 1.615.44a.75.75 0 0 0 .396-1.447l-1.615-.44a.75.75 0 0 0-.396 1.447M5.697 7.388l.577 1.038a.75.75 0 1 0 1.312-.728L7.009 6.66a.75.75 0 1 0-1.312.728M3.284 8.94l.44 1.615a.75.75 0 1 0 1.448-.394l-.44-1.615a.75.75 0 1 0-1.448.394m1.15 4.219.246.896a.75.75 0 1 0 1.446-.396l-.245-.896a.75.75 0 1 0-1.446.396z"></path></svg>,
                      'Flat-screen TV': <svg viewBox="0 0 24 24" width="16" height="16"><path d="M22.502 9v4.5a2.25 2.25 0 0 1-2.25 2.25h-16.5a2.25 2.25 0 0 1-2.25-2.25v-9a2.25 2.25 0 0 1 2.25-2.25h16.5a2.25 2.25 0 0 1 2.25 2.25zm1.5 0V4.5a3.75 3.75 0 0 0-3.75-3.75h-16.5A3.75 3.75 0 0 0 .002 4.5v9a3.75 3.75 0 0 0 3.75 3.75h16.5a3.75 3.75 0 0 0 3.75-3.75zM6.75 22.5c0-1.101 2.298-2.25 5.25-2.25s5.25 1.149 5.25 2.25l.75-.75H6zm-1.5 0c0 .414.336.75.75.75h12a.75.75 0 0 0 .75-.75c0-2.212-3.076-3.75-6.75-3.75s-6.75 1.538-6.75 3.75m6.002-6v3a.75.75 0 0 0 1.5 0v-3a.75.75 0 0 0-1.5 0"></path></svg>,
                      'Soundproofing': <svg viewBox="0 0 24 24" width="16" height="16"><path d="m10.413 17.368 3.284 2.09c.947.713 2.357.511 3.103-.483.292-.39.45-.863.45-1.35v-5.25a.75.75 0 0 0-1.5 0v5.25a.75.75 0 0 1-1.2.6l-3.331-2.123a.75.75 0 0 0-.806 1.266M17.25 5.625a2.25 2.25 0 0 0-3.6-1.8L7.097 7.992l.403-.117h-3a2.25 2.25 0 0 0-2.25 2.25v3a2.25 2.25 0 0 0 2.25 2.25h.625a.75.75 0 0 0 0-1.5H4.5a.75.75 0 0 1-.75-.75v-3a.75.75 0 0 1 .75-.75h3a.75.75 0 0 0 .403-.117l6.6-4.2A.8.8 0 0 1 15 4.875a.75.75 0 0 1 .75.75.75.75 0 0 0 1.5 0M3.48 20.451l18-15a.75.75 0 0 0-.96-1.152l-18 15a.75.75 0 0 0 .96 1.152"></path></svg>,
                      'Terrace': <svg viewBox="0 0 24 24" width="16" height="16"><path d="m.768 11.413 1.5 6.75a.75.75 0 0 0 1.464-.326l-1.5-6.75a.75.75 0 0 0-1.464.326M2.22 23.456l1.5-5.25-.72.544h3a.75.75 0 0 1 .75.75v3.75a.75.75 0 0 0 1.5 0V19.5A2.25 2.25 0 0 0 6 17.25H3a.75.75 0 0 0-.721.544l-1.5 5.25a.75.75 0 1 0 1.442.412zm19.547-12.369-1.5 6.75a.75.75 0 1 0 1.464.326l1.5-6.75a.75.75 0 1 0-1.464-.326m1.453 11.957-1.5-5.25a.75.75 0 0 0-.72-.544h-3a2.25 2.25 0 0 0-2.25 2.25v3.75a.75.75 0 0 0 1.5 0V19.5a.75.75 0 0 1 .75-.75h3l-.721-.544 1.5 5.25a.75.75 0 1 0 1.442-.412zM11.25 6.75v16.5a.75.75 0 0 0 1.5 0V6.75a.75.75 0 0 0-1.5 0m-4.5 7.5h10.5a.75.75 0 0 0 0-1.5H6.75a.75.75 0 0 0 0 1.5M1.5 6l10.064-4.37c.297-.161.575-.161.803-.033l10.178 4.425L22.5 6zm0 1.5h21a1.5 1.5 0 0 0 .689-2.832L13.034.255c-.616-.35-1.452-.35-2.136.034L.858 4.646c-.544.28-.856.792-.857 1.352A1.5 1.5 0 0 0 1.499 7.5z"></path></svg>,
                      'Minibar': <svg viewBox="0 0 128 128" width="16" height="16"><path d="M48.25 4v36a20.13 20.13 0 0 1-16 19.59V124a4 4 0 0 1-8 0V59.58A20.09 20.09 0 0 1 8.25 40V4a4 4 0 0 1 8 0v36a12 12 0 0 0 8 11.28V4a4 4 0 0 1 8 0v47.29a12.1 12.1 0 0 0 8-11.3V4a4 4 0 0 1 8 0m65 120a4 4 0 0 1-4 4H77.28a4 4 0 0 1 0-8h12V95.7c-14.139-2.16-24.023-15.135-22.35-29.34l6-59.17a8 8 0 0 1 8-7.19h24.67a8 8 0 0 1 8 7.19l6 59.23c1.633 14.181-8.24 27.115-22.35 29.28V120h12a4 4 0 0 1 3.96 4zM80.89 8l-2.43 24H108l-2.4-24zM83 84.88A18.5 18.5 0 0 0 93.17 88h.15a18.5 18.5 0 0 0 10.17-3.12 18.48 18.48 0 0 0 8.12-17.59L108.85 40H77.64l-2.76 27.23A18.49 18.49 0 0 0 83 84.88"></path></svg>,
                      'Free WiFi': <svg viewBox="0 0 24 24" width="16" height="16"><path d="M14.25 18.75a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0m1.5 0a3.75 3.75 0 1 0-7.5 0 3.75 3.75 0 0 0 7.5 0m2.08-5.833a8.25 8.25 0 0 0-11.666 0 .75.75 0 0 0 1.06 1.06 6.75 6.75 0 0 1 9.546 0 .75.75 0 0 0 1.06-1.06m3.185-3.182c-4.979-4.98-13.051-4.98-18.03 0a.75.75 0 1 0 1.06 1.06c4.394-4.393 11.516-4.393 15.91 0a.75.75 0 1 0 1.06-1.06m2.746-3.603C17.136-.043 6.864-.043.24 6.132A.75.75 0 1 0 1.26 7.23c6.05-5.638 15.429-5.638 21.478 0a.75.75 0 0 0 1.022-1.098z"></path></svg>,
                    };
                    return room.roomFeatures.map((feature, idx) => {
                      console.log("Rendering room feature:", feature);
                      return (
                        <div key={idx} className="flex items-center gap-2">
                          <span className="w-5 h-5">
                            {svgIcons[feature] || (
                              <svg viewBox="0 0 128 128" width="16" height="16">
                                <path d="M56.33 100a4 4 0 0 1-2.82-1.16L20.68 66.12a4 4 0 1 1 5.64-5.65l29.57 29.46 45.42-60.33a4 4 0 1 1 6.38 4.8l-48.17 64a4 4 0 0 1-2.91 1.6z"></path>
                              </svg>
                            )}
                          </span>
                          <span title={`key: roomDetails.features.${feature}`}>
                            {t(`roomDetails.features.${feature}`, feature)}
                          </span>
                        </div>
                      );
                    });
                  })()}
                </div>
              </div>
            )}
            <div>
              {t("roomDetails.surface", {
                value: room.surface,
                defaultValue: `Surface: ${room.surface} m²`
              })}
            </div>
            <div>
              {t("roomDetails.beds", {
                value: (() => {
                  const doubleCount = room.doubleBedCount;
                  const singleCount = room.singleBedCount;
                  const doubleText =
                    doubleCount > 0
                      ? `${doubleCount} ${t("bedTypes.double")}${doubleCount > 1 ? 's' : ''}`
                      : '';
                  const singleText =
                    singleCount > 0
                      ? `${singleCount} ${t("bedTypes.single")}${singleCount > 1 ? 's' : ''}`
                      : '';
                  return [doubleText, singleText]
                    .filter(Boolean)
                    .join(` ${t(room.requiresBedChoice ? "bedTypes.or" : "bedTypes.and")} `);
                })(),
                defaultValue: `Beds: ${room.doubleBedCount || 0} double, ${room.singleBedCount || 0} single`
              })}
            </div>
            <div>
              {t("roomDetails.view", {
                value: room.viewOptions
                  ?.map(v => t(`viewOptions.${v.toLowerCase().replaceAll(' ', '_')}`, v))
                  .join(', '),
                defaultValue: `View: ${room.viewOptions?.join(', ')}`
              })}
            </div>
            <p className="text-sm text-gray-700 whitespace-pre-line">{room.description}</p>


            {(() => {
              const namespaces = [
                "bathroomFeatures",
                "media",
                "food",
                "outdoor",
                "general",
                "accessibility",
                "layout"
              ];
              // List of [translated section title with fallback, data]
              return [
                [t("bathroomFeatures.title", "Bathroom Features"), room.bathroomFeatures],
                [t("media.title", "Media & Technology"), room.mediaAndTech],
                [t("food.title", "Food & Drink"), room.foodAndDrink],
                [t("outdoor.title", "Outdoor"), room.outdoor],
                [t("general.title", "General Facilities"), room.generalFacilities],
                [t("accessibility.title", "Accessibility"), room.accessibility],
                [t("layout.title", "Layout"), room.specialLayout]
              ].map(([label, list], idxSection) =>
                list?.length > 0 ? (
                  <div key={label}>
                    <strong>{label}</strong>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 mt-1 text-sm text-gray-800">
                      {list
                        .reduce(
                          (acc, curr, idx) => {
                            acc[idx % 2].push(curr);
                            return acc;
                          },
                          [[], []]
                        )
                        .map((colItems, colIdx) => (
                          <ul key={colIdx} className="space-y-1">
                            {colItems.map((item, idx) => (
                              <li key={idx} className="flex items-start gap-2">
                                <svg viewBox="0 0 128 128" width="16" height="16" className="flex-shrink-0 mt-1">
                                  <path d="M56.33 100a4 4 0 0 1-2.82-1.16L20.68 66.12a4 4 0 1 1 5.64-5.65l29.57 29.46 45.42-60.33a4 4 0 1 1 6.38 4.8l-48.17 64a4 4 0 0 1-2.91 1.6z"></path>
                                </svg>
                                <span>{t(`${namespaces[idxSection]}.items.${item}`, item)}</span>
                              </li>
                            ))}
                          </ul>
                        ))}
                    </div>
                  </div>
                ) : null
              );
            })()}

          </div>
        </div>
        <div className="mt-6 flex justify-center">
         
        </div>
      </div>
    </motion.div>
  );
}