import React from "react";
import { useNavigate } from "react-router-dom";
import ModifyRoomSummaryCard from "./ModifyRoomSummaryCard";
import { motion, AnimatePresence } from "framer-motion";
import { formatCurrency } from "../utils/formatCurrency";
import { X } from "lucide-react";

const MobileReservationSummary = ({
  isOpen,
  onClose,
  reservation,
  selectedRooms,
  setSelectedRooms,
  exchangeRate,
  currencyCode,
  onConfirm,
  searchStart,
  searchEnd,
  availableRooms
}) => {
  const navigate = useNavigate();

  const availableToCheck = Array.isArray(availableRooms) && availableRooms.length > 0
    ? availableRooms
    : Array.isArray(reservation?.availableRooms)
    ? reservation.availableRooms
    : selectedRooms.map(r => ({
        _id: r._id,
        roomId: r.roomId,
        unavailable: false,
      }));

  const filteredAvailableRooms = selectedRooms.filter(room => {
    const match = availableToCheck.find((ar) =>
      ar.roomId === room.roomId ||
      ar._id === room.roomId ||
      ar._id === room._id ||
      ar.roomId === room._id
    );
    return match && match.unavailable !== true;
  });

  const subtotal = filteredAvailableRooms.reduce((sum, room) => sum + (room.baseRate || 0), 0);
  const taxTotal = filteredAvailableRooms.reduce((sum, room) => {
    const base = room.baseRate || 0;
    return sum + base * (10 / 110); // Extract VAT from VAT-inclusive base
  }, 0);
  const total = subtotal; // Already includes VAT

  const allRemoved = selectedRooms.length === 0;

  const hasUnavailable = selectedRooms.some((room) => {
    const match = availableToCheck.find(
      (ar) =>
        ar.roomId === room.roomId ||
        ar._id === room.roomId ||
        ar._id === room._id ||
        ar.roomId === room._id
    );
    return !match || match.unavailable === true;
  });

  const [showUnavailableMessage, setShowUnavailableMessage] = React.useState(false);

  const guestsFromStorage = localStorage.getItem("searchGuests");
  const parsedGuests = guestsFromStorage ? JSON.parse(guestsFromStorage) : [];
  const guestSummaryData = Array.isArray(parsedGuests)
    ? parsedGuests.reduce(
        (acc, g) => {
          acc.totalAdults += g.adults || 0;
          acc.totalChildren += g.children || 0;
          return acc;
        },
        { totalAdults: 0, totalChildren: 0 }
      )
    : { totalAdults: 0, totalChildren: 0 };

  const totalAdults = guestSummaryData.totalAdults;
  const totalChildren = guestSummaryData.totalChildren;

  let totalAdultCapacity = 0;
  let totalChildCapacity = 0;

  selectedRooms.forEach(room => {
    const capacity = room.capacity || {};
    const maxAdults = capacity.maxAdults || 0;
    const maxChildren = capacity.maxChildren || 0;
    totalAdultCapacity += maxAdults;
    totalChildCapacity += maxChildren;


    fetch(`${import.meta.env.VITE_API_BASE_URL}/api/rooms/${room.roomId}?propertyId=${reservation.propertyId}`)
      .then(res => res.json())
      .then(data => {
      })
      .catch(err => console.error("Error fetching capacity:", err));
  });

  const totalGuests = totalAdults + totalChildren;
  const guestCapacity = totalAdultCapacity;
  const childExtraAllowance = totalChildCapacity;

  const needsMoreRooms = totalGuests > guestCapacity + childExtraAllowance;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black bg-opacity-40 z-50 flex justify-end sm:hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="w-full h-full bg-white p-4 overflow-y-auto rounded-t-2xl"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ duration: 0.3 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-end">
              <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                <X size={24} />
              </button>
            </div>
            <div className="text-center text-lg font-semibold mb-4">Reservation Summary</div>
            <div className="space-y-2 text-sm text-gray-700">
              <div>
                Ref #{reservation.referenceNumber} • {reservation.nights} Nights • {reservation.guests}
              </div>
              <div>
                {new Date(reservation.checkIn).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })} – {new Date(reservation.checkOut).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
              </div>
              {searchStart && searchEnd && (
                <div className="text-sm text-gray-500 mt-1">
                  {(() => {
                    const guestsFromStorage = localStorage.getItem("searchGuests");
                    const parsedGuests = guestsFromStorage ? JSON.parse(guestsFromStorage) : [];


                    const summary = Array.isArray(parsedGuests)
                      ? parsedGuests.reduce(
                          (acc, g) => {
                            acc.totalAdults += g.adults || 0;
                            acc.totalChildren += g.children || 0;
                            return acc;
                          },
                          { totalAdults: 0, totalChildren: 0 }
                        )
                      : { totalAdults: 0, totalChildren: 0 };

                    const totalAdults = summary.totalAdults;

                    const guestSummary = `${summary.totalAdults} Adults${summary.totalChildren ? `, ${summary.totalChildren} Children` : ""}`;

                    const totalAdultCapacity = selectedRooms.reduce((sum, room) => {
                      return sum + (room.capacity?.maxAdults || 0);
                    }, 0);

                    const needsMoreRooms = totalAdults > totalAdultCapacity;

                    const nights = Math.max(
                      (new Date(searchEnd) - new Date(searchStart)) / (1000 * 60 * 60 * 24),
                      0
                    );

                    return (
                      <>
                        New Search:{" "}
                        {new Date(searchStart).toLocaleDateString("en-GB", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}{" "}
                        –{" "}
                        {new Date(searchEnd).toLocaleDateString("en-GB", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}{" "}
                        • {nights} Nights • {guestSummary}
                      </>
                    );
                  })()}
                </div>
              )}
              {(() => {
                const availableToCheck = Array.isArray(availableRooms) && availableRooms.length > 0
                  ? availableRooms
                  : Array.isArray(reservation?.availableRooms)
                  ? reservation.availableRooms
                  : selectedRooms.map(r => ({
                      _id: r._id,
                      roomId: r.roomId,
                      unavailable: false,
                    }));
                return selectedRooms.map((room, idx) => {
                  const original = reservation.rooms?.find(orig => orig.instanceId === room.instanceId);
                  const isNew = !original;
                  const hasChanged = !!original && (
                    original.baseRate !== room.baseRate ||
                    original.taxesAndFees !== room.taxesAndFees ||
                    original.totalAfterTax !== room.totalAfterTax
                  );

                  const matchingAvailable = availableToCheck.find((ar) => {
                    const match =
                      ar.roomId === room.roomId ||
                      ar._id === room.roomId ||
                      ar._id === room._id ||
                      ar.roomId === room._id;

                    if (match) {
                      
                    }

                    return match;
                  });
                  const isUnavailable = !matchingAvailable || matchingAvailable.unavailable === true;

                  

                  return (
                    <ModifyRoomSummaryCard
                      key={room.instanceId || idx}
                      room={{ ...room, startDate: searchStart, endDate: searchEnd }}
                      original={{ ...original, startDate: reservation.checkIn, endDate: reservation.checkOut } || room}
                      isNewlyAdded={isNew}
                      priceChanged={hasChanged}
                      isUnavailable={isUnavailable}
                      exchangeRate={exchangeRate}
                      currencyCode={currencyCode}
                      onRemove={() =>
                        setSelectedRooms(prev =>
                          prev.filter(sel => sel.instanceId !== room.instanceId)
                        )
                      }
                      property={reservation}
                    />
                  );
                });
              })()}
              <div className="mt-6 bg-[#f9f9f9] rounded-xl p-4 shadow-sm border border-gray-200">
                <div className="space-y-2 text-sm text-gray-700">
                  <div className="flex justify-between font-medium">
                    <span>Subtotal</span><span>{formatCurrency(subtotal, exchangeRate, currencyCode)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Includes VAT</span><span>{formatCurrency(taxTotal, exchangeRate, currencyCode)}</span>
                  </div>
                  <div className="flex justify-between text-lg font-semibold mt-2">
                    <span>Total</span><span>{formatCurrency(total, exchangeRate, currencyCode)}</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => {
                  if (!hasUnavailable && !allRemoved) {
                    const guestsFromStorage = localStorage.getItem("searchGuests");
                    const parsedGuests = guestsFromStorage ? JSON.parse(guestsFromStorage) : [];
                    const summary = Array.isArray(parsedGuests)
                      ? parsedGuests.reduce(
                          (acc, g) => {
                            acc.totalAdults += g.adults || 0;
                            acc.totalChildren += g.children || 0;
                            return acc;
                          },
                          { totalAdults: 0, totalChildren: 0 }
                        )
                      : { totalAdults: 0, totalChildren: 0 };

                    const totalGuests = summary.totalAdults + summary.totalChildren;

                    navigate("/modification-confirmation", {
                      state: {
                        reservationId: reservation?.reservationId || reservation?._id || "",
                        dateRange: { checkIn: searchStart, checkOut: searchEnd },
                        guests: {
                          adults: summary.totalAdults,
                          children: summary.totalChildren
                        },
                        totalGuests
                      }
                    });
                  } else {
                    setShowUnavailableMessage(true);
                  }
                }}
                disabled={allRemoved || needsMoreRooms}
                className={`w-full mt-3 mb-1 text-base py-2.5 rounded-full text-center transition-all ${
                  allRemoved || needsMoreRooms
                    ? 'bg-gray-400 cursor-not-allowed text-white'
                    : 'bg-[#886f48] text-white hover:opacity-90'
                }`}
              >
                Continue to Confirmation
              </button>
              {allRemoved && (
                <div className="text-sm text-red-600 text-center mt-2 font-medium">
                  Please select at least one room to continue.
                </div>
              )}
              {hasUnavailable && showUnavailableMessage && (
                <div className="text-sm text-red-600 text-center mt-2 font-medium">
                  Some rooms are unavailable. Please update your reservation.
                </div>
              )}
              <AnimatePresence>
                {needsMoreRooms && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 5 }}
                    className="text-sm text-red-600 text-center mt-2 font-medium"
                  >
                    {/*
                      Define totalGuests in the current render context if not already declared:
                      const totalGuests = totalAdults + totalChildren;
                    */}
                    {/*
                      totalGuests is already defined above:
                      const totalGuests = totalAdults + totalChildren;
                    */}
                    Add more rooms to accommodate {totalGuests} guest{totalGuests > 1 ? 's' : ''}.
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default MobileReservationSummary;