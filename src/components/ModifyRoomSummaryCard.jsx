import React, { useState } from "react";
import { formatCurrency } from "../utils/formatCurrency";

const ModifyRoomSummaryCard = ({
  room,
  original,
  isNewlyAdded,
  priceChanged,
  isUnavailable,
  exchangeRate,
  currencyCode,
  onRemove,
  nights,
  property
}) => {
  const [showDetails, setShowDetails] = useState(false);
  // Inline log to confirm onRemove is being passed

  const label = isNewlyAdded
    ? { text: "Newly Added", color: "green" }
    : priceChanged
    ? { text: "Updated Rate", color: "yellow" }
    : null;

  const renderRate = (labelText, originalValue, newValue) => {
    const hasChanged = priceChanged && !isNewlyAdded && originalValue !== newValue;
    return (
      <div className="flex justify-between items-center text-sm text-gray-600 mt-1">
        <span>{labelText}:</span>
        {hasChanged ? (
          <div className="flex flex-col items-end text-right">
            <span className="line-through text-gray-400">{formatCurrency(originalValue, exchangeRate, currencyCode)}</span>
            <span className="text-gray-900 font-semibold">{formatCurrency(newValue, exchangeRate, currencyCode)}</span>
          </div>
        ) : (
          <span className="text-right">{formatCurrency(newValue, exchangeRate, currencyCode)}</span>
        )}
      </div>
    );
  };

  const renderTextRate = (labelText, originalValue, newValue) => {
    const hasChanged = priceChanged && !isNewlyAdded && originalValue !== newValue;
    return (
      <div className="flex justify-between items-center text-sm text-gray-600 mt-1">
        <span>{labelText}:</span>
        {hasChanged ? (
          <div className="flex flex-col items-end text-right">
            <span className="line-through text-gray-400">{originalValue}</span>
            <span className="text-gray-900 font-semibold">{newValue}</span>
          </div>
        ) : (
          <span className="text-right">{newValue}</span>
        )}
      </div>
    );
  };

  const calculateNights = (startDate, endDate) => {
    if (!startDate || !endDate) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    return Math.max(1, Math.round((end - start) / (1000 * 60 * 60 * 24)));
  };

  // 🛠️ DEBUG logs to inspect room data and night calculation

  return (
    <div className="flex flex-col border-t border-gray-200 pt-4">
      <div className="flex items-center justify-between">
        {/* Left: Image */}
        <div className="w-24 h-20 shrink-0">
          <img
            src={room.image}
            alt={room.roomType}
            className="w-24 h-20 object-cover rounded-lg border border-gray-200 shadow-sm"
          />
        </div>

        {/* Middle: Title and guests with total rate */}
        <div className="flex-1 ml-4 flex justify-between">
          <div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-gray-800">{room.roomType}</h3>
                {onRemove && (
                  <button
                    onClick={onRemove}
                    className="text-gray-400 hover:text-red-500 text-sm"
                  >
                    ✕
                  </button>
                )}
              </div>
              {label && !isUnavailable && (
                <span className={`mt-1 inline-block px-3 py-0.5 rounded-full text-xs font-medium border text-${label.color}-700 border-${label.color}-300`}>
                  {label.text}
                </span>
              )}
              {isUnavailable && (
                <span className="mt-1 inline-block px-3 py-0.5 rounded-full text-xs font-medium border text-red-700 border-red-300 bg-red-50">
                  Unavailable
                </span>
              )}
            </div>
            <div className="text-sm text-gray-500">
              {room.guests || "2 adults"}
            </div>
            <div
              className="text-sm text-blue-600 underline mt-1 cursor-pointer hover:text-blue-800 transition"
              onClick={() => setShowDetails(!showDetails)}
            >
              {showDetails ? "Hide details" : "See details"}
            </div>
          </div>

          <div className="text-right ml-4 flex flex-col items-end justify-between">
            <div className="text-sm font-semibold text-gray-900">
              {(() => {
                const base = room.baseRate || 0;
                const vatRate = property?.policy?.vat?.percentage || 10;
                const vat = Math.round(base * (vatRate / (100 + vatRate)) * 100) / 100;
                const priceBeforeVat = base - vat; // Show base excluding VAT

                return isUnavailable ? (
                  <span className="line-through text-gray-400">
                    {formatCurrency(priceBeforeVat, exchangeRate, currencyCode)}
                  </span>
                ) : (
                  formatCurrency(priceBeforeVat, exchangeRate, currencyCode)
                );
              })()}
            </div>
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="mt-1 focus:outline-none"
              aria-label="Toggle details"
            >
              <svg
                className={`w-4 h-4 transform ${showDetails ? "rotate-180" : "rotate-0"} transition-transform duration-300`}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Collapsible rate block */}
      <div className={`transition-all duration-300 overflow-hidden ${showDetails ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"}`}>
        <div className="bg-gray-50 rounded-md p-4 mt-2 text-sm text-gray-800 space-y-4">
          <div>
            <div className="text-xs font-bold text-gray-500">ROOM</div>
            <div className="mt-1">{room.roomType}</div>
            <div className="text-xs italic text-gray-500">
              {(room.breakfastIncluded ?? room.includeBreakfast ?? room.breakfast)
                ? "Breakfast Included"
                : "Room Only"}
            </div>
            <div className="text-xs text-gray-400 mt-1">No pricing conditions</div>
          </div>

          <div className="border-t border-gray-200 pt-3">
            <div className="text-xs font-bold text-gray-500">TAXES AND FEES</div>
            {renderRate("Price before tax", original.baseRate, room.baseRate)}
            {(() => {
              const base = room.baseRate || 0;
              const vatRate = property?.policy?.vat?.percentage || 10;
              const vat = Math.round(base * (vatRate / (100 + vatRate)) * 100) / 100;
              return renderRate("Tax", original.taxesAndFees, vat);
            })()}
          </div>
          <div className="border-t border-gray-200 pt-3">
            <div className="text-xs font-bold text-gray-500">RATE DETAILS</div>
            {renderRate(
              "Per Night",
              original.baseRate && original.startDate && original.endDate
                ? Math.round(original.baseRate / calculateNights(original.startDate, original.endDate))
                : null,
              (room.baseRate || room.price || room.displayPrice) && (nights || (room.startDate && room.endDate))
                ? Math.round(
                    (room.baseRate || room.price || room.displayPrice) /
                      (nights || calculateNights(room.startDate, room.endDate))
                  )
                : null
            )}
            {renderTextRate(
              "Nights",
              calculateNights(original?.startDate, original?.endDate),
              nights ?? calculateNights(room.startDate, room.endDate)
            )}
          </div>
          <div className="border-t border-gray-200 pt-3">
            {(() => {
              const base = room.baseRate || 0;
              const vatRate = property?.policy?.vat?.percentage || 10;
              const vat = Math.round(base * (vatRate / (100 + vatRate)) * 100) / 100;
              const finalRate = base; // Already VAT-inclusive

              return renderRate("Final Rate", original.totalAfterTax, finalRate);
            })()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModifyRoomSummaryCard;