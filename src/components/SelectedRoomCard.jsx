// src/components/SelectedRoomCard.jsx

import React, { useState, useEffect } from "react";
import { useCurrency } from "../contexts/CurrencyProvider";
import { formatCurrency } from "../utils/formatCurrency";
import { useLocation } from "react-router-dom";
import { motion } from "framer-motion";

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

const SelectedRoomCard = ({ room, onRemove, loadingRate }) => {

  const [showDetails, setShowDetails] = useState(false);
  const { currency, exchangeRate } = useCurrency();
  const location = useLocation();
  const {
    roomName,
    guests,
    price,
    vat,
    saverRate,
    pricingConditionLink
  } = room || {};

  // Updated price calculation block

  const nights = room.nights ?? 1;
  const perNight = room.perNight ?? (room.price && nights ? room.price / nights : 0);
  const totalBeforeTax = room.price ?? (perNight * nights);
  const vatValue = totalBeforeTax * (10 / 110); // Always recalculate from total
  const baseBeforeVat = totalBeforeTax - vatValue;
  const total = totalBeforeTax; // VAT is included

  // Remove old VAT/price logic, use new calculation
  const totalPrice = typeof baseBeforeVat === "number"
    ? formatCurrency(baseBeforeVat, exchangeRate, currency)
    : "Updating...";

  const formattedVat = typeof vatValue === "number"
    ? formatCurrency(vatValue, exchangeRate, currency)
    : "Updating...";

  return (
    <div className={`border-t border-gray-200 overflow-hidden mb-0 mt-0 ${room.unavailable ? "opacity-50" : "hover:bg-gray-50"}`}>
      <div className="flex justify-between items-center text-sm">
        <div className="flex items-start gap-3">
          {room.images?.length > 0 && (
            <img
              src={room.images?.[0] || "https://via.placeholder.com/80x60?text=No+Image"}
              alt={roomName || "Room image"}
              className="w-20 h-16 object-cover rounded border border-gray-200"
            />
          )}
          <div className="flex flex-col gap-1 flex-grow">
            <span className="text-gray-700 font-bold">{roomName || "Room Unavailable"}</span>
            {room.unavailable && (
              <span className="text-xs text-red-600 font-semibold mt-1">Unavailable</span>
            )}
            <div className="text-xs text-gray-600">{guests || "Guest info missing"}</div>
            <div
              className="text-xs text-blue-600 underline cursor-pointer hover:text-blue-800"
              onClick={() => setShowDetails(!showDetails)}
            >
              {showDetails ? `Hide details` : `See details`}
            </div>
          </div>
          {location.pathname !== "/confirmation" && location.pathname !== "/guest-info" && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onRemove();
              }}
              className="text-gray-400 hover:text-red-500 transition-colors duration-200 text-xs ml-2"
              title="Remove room"
            >
              ✕
            </button>
          )}
        </div>
        <div className="flex items-center flex-col">
          {loadingRate ? (
            <SkeletonBlock className="h-6 w-20 mb-1" />
          ) : (
            <div className="text-right font-semibold text-gray-900">
              {totalPrice}
            </div>
          )}
          {loadingRate ? (
            <SkeletonBlock className="h-4 w-28 mb-1" />
          ) : (
            room.quantity > 1 && (
              <div className="text-[11px] text-gray-500 text-right">
                {formatCurrency(perNight, exchangeRate, currency)} × {nights} × {room.quantity}
              </div>
            )
          )}
          <button onClick={() => setShowDetails(!showDetails)} className="transition-transform duration-300 mt-1">
            <svg className={`w-4 h-4 transform ${showDetails ? "rotate-180" : "rotate-0"} transition-transform duration-300`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>
        </div>
      </div>

      <div
        className={`transition-all duration-300 overflow-hidden ${showDetails ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"}`}
      >
        <div className="bg-gray-50 rounded-md p-3 mt-2 space-y-1.5 text-sm text-gray-700 max-h-74 overflow-y-auto">
          <div>
            <div className="font-bold text-xs text-gray-500">ROOM</div>
            <div className="mt-1">{roomName || "Room Unavailable"}</div>
            {(room.breakfastIncluded !== undefined || room.includeBreakfast !== undefined || room.breakfast !== undefined) && (
              <div className="text-xs text-gray-500 italic">
                {(room.breakfastIncluded ?? room.includeBreakfast ?? room.breakfast) ? "Breakfast Included" : "Room Only"}
              </div>
            )}
          </div>
          <div>
            {pricingConditionLink ? (
              <a
                href={pricingConditionLink}
                className="text-blue-600 underline text-xs mt-1 inline-block hover:text-blue-800 transition-colors duration-200"
              >
                Pricing conditions
              </a>
            ) : (
              <span className="text-gray-400 text-xs mt-1 inline-block">No pricing conditions</span>
            )}
          </div>
          <div className="border-t border-gray-200 pt-2">
            <div className="font-bold text-xs text-gray-500">TAXES AND FEES</div>
            <div className="flex justify-between text-sm">
              <span>Total (incl. VAT)</span>
              <span>{formatCurrency(totalBeforeTax, exchangeRate, currency)}</span>
            </div>
            <div className="flex justify-between text-sm mt-1">
              <span>VAT</span>
              <span>
                {formattedVat}{" "}
                <span className="text-[11px] text-gray-400 font-normal"></span>
              </span>
            </div>
          </div>
          <div className="border-t border-gray-200 pt-2">
            <div className="font-bold text-xs text-gray-500">RATE DETAILS</div>
            <div className="flex justify-between text-sm mt-1">
              <span>Per Night</span>
              <span>
                {typeof perNight === "number"
                  ? formatCurrency(perNight, exchangeRate, currency)
                  : "Updating..."}
              </span>
            </div>
            <div className="flex justify-between text-sm mt-1">
              <span>Nights</span>
              <span>{nights || "–"}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SelectedRoomCard;