import React, { useState, useEffect } from "react";
import ReviewModal from "./ReviewModal";
import axios from "axios";
import { CalendarDays, User } from "lucide-react";
import SelectedRoomCard from "./SelectedRoomCard";
import { useSelectedRooms } from "../contexts/SelectedRoomsContext";
import { useSelectedDate } from "../contexts/SelectedDateContext";
import { useCurrency } from "../contexts/CurrencyProvider";
import { formatCurrency } from "../utils/formatCurrency";
import { useNavigate, useLocation } from "react-router-dom";
import { useSelectedServices } from "../contexts/SelectedServicesContext";
import SelectedServiceCard from "./SelectedServiceCard";
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


const StarsLayout = ({ count }) => {
  const topStars = Math.min(2, count);
  const bottomStars = Math.max(0, count - topStars);

  return (
    <div className="flex flex-col items-center ml-1 -mt-[2px] gap-[0.5px]">
      <div className="flex justify-center gap-[0.5px]">
        {Array.from({ length: topStars }).map((_, i) => (
          <svg
            key={`top-${i}`}
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 18 18"
            className="w-[10px] h-[10px] fill-current text-indigo-900"
          >
            <path d="M9 1.5l2.19 4.43 4.91.71-3.55 3.46.84 4.9L9 12.77l-4.39 2.32.84-4.9L2 6.64l4.91-.71L9 1.5z" />
          </svg>
        ))}
      </div>
      <div className="flex justify-center gap-[0.5px] -mt-[1px]">
        {Array.from({ length: bottomStars }).map((_, i) => (
          <svg
            key={`bottom-${i}`}
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 18 18"
            className="w-[10px] h-[10px] fill-current text-indigo-900"
          >
            <path d="M9 1.5l2.19 4.43 4.91.71-3.55 3.46.84 4.9L9 12.77l-4.39 2.32.84-4.9L2 6.64l4.91-.71L9 1.5z" />
          </svg>
        ))}
      </div>
    </div>
  );
};

const PriceSummary = ({ propertyId, selectedRooms: propSelectedRooms }) => {
  const [showDetails, setShowDetails] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [property, setProperty] = useState(null);

  const [dummyTrigger, setDummyTrigger] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  // loadingRate state for shimmer effect on rate reload
  const [loadingRate, setLoadingRate] = useState(false);

  const { selectedRooms: contextSelectedRooms, removeRoom } = useSelectedRooms();
  const rooms = propSelectedRooms ?? contextSelectedRooms;
  // Debug which rooms data is used in the price calculation
  // removed safeSelectedRooms — using `rooms` instead
  const { selectedServices = [], removeService } = useSelectedServices() || {};
  const { dateRange } = useSelectedDate();
  const { currency, exchangeRate } = useCurrency();

  useEffect(() => {
    const handleSelectedServicesUpdated = () => {
      setRefreshKey(prev => prev + 1); // force re-render
    };

    window.addEventListener("selectedServicesUpdated", handleSelectedServicesUpdated);
    window.addEventListener("storage", handleSelectedServicesUpdated);
    window.addEventListener("localStorageUpdated", handleSelectedServicesUpdated);

    return () => {
      window.removeEventListener("selectedServicesUpdated", handleSelectedServicesUpdated);
      window.removeEventListener("storage", handleSelectedServicesUpdated);
      window.removeEventListener("localStorageUpdated", handleSelectedServicesUpdated);
    };
  }, []);

useEffect(() => {
  setDummyTrigger(prev => !prev); // Force re-render on selectedServices change
}, [selectedServices]);

  const navigate = useNavigate();
  const location = useLocation();
  const pathSequence = ["/", "/guest-info", "/payment", "/confirmation"];
  const currentPath = location.pathname;
  const currentIndex = pathSequence.indexOf(currentPath);
  const nextPath = pathSequence[currentIndex + 1] || "/confirmation";

  useEffect(() => {
    const fetchProperty = async () => {
      setLoadingRate(true);
      const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/property?propertyId=${propertyId}`);
      setProperty(res.data);
      setLoadingRate(false);
    };
    fetchProperty();
  }, [propertyId]);

  // Re-enable shimmer effect on date/guest change (not just propertyId change)
  useEffect(() => {
    if (contextSelectedRooms.length > 0) {
      setLoadingRate(true);
      const timeout = setTimeout(() => setLoadingRate(false), 200);
      return () => clearTimeout(timeout);
    }
  }, [dateRange, contextSelectedRooms]);


  const nights =
    dateRange.startDate && dateRange.endDate
      ? Math.max(
          1,
          Math.ceil(
            (new Date(dateRange.endDate) - new Date(dateRange.startDate)) /
              (1000 * 60 * 60 * 24)
          )
        )
      : 0;

  const vatPercentage = parseFloat(localStorage.getItem('vatPercentage') || '0');

  // Use room.price if defined, else fallback to perNight * nights
  const roomTotalBeforeTax = rooms.reduce((sum, room) => {
    const base = room.price ?? (room.perNight * room.nights) ?? 0;
    return sum + base;
  }, 0);
  const serviceTotalBeforeTax = selectedServices.reduce((sum, s) => sum + (s.price || 0), 0);

  // Calculate VAT for rooms: use price if defined, else fallback to perNight * nights
  const roomVat = rooms.reduce((sum, room) => {
    const base = room.price ?? (room.perNight * room.nights) ?? 0;
    const vat = base * (10 / 110);
    return sum + vat;
  }, 0);

  // Calculate VAT for services: use s.vat if defined, otherwise fallback to price * 10/110 (VAT-inclusive)
  const serviceVat = selectedServices.reduce((sum, s) => {
    const price = s.price || 0;
    const vat = typeof s.vat === "number" ? s.vat : price * (10 / 110);
    return sum + vat;
  }, 0);

  const totalBeforeTax = serviceTotalBeforeTax + roomTotalBeforeTax;
  const totalVat = serviceVat + roomVat;
  // totalBeforeTax is already VAT-inclusive, so do not add VAT again
  const totalPrice = totalBeforeTax; // already includes VAT, no need to add again


 

  // Get totalGuests from localStorage guestRoomSelection
  const guestRooms = JSON.parse(localStorage.getItem("guestRoomSelection") || "[]");
  const totalGuests = {
    adults: guestRooms.reduce((sum, r) => sum + (r.adults || 0), 0),
    children: guestRooms.reduce((sum, r) => sum + (r.children || 0), 0)
  };

  // Calculate selected rooms' total capacity
  const selectedTotalGuests = {
    adults: rooms.reduce((sum, room) => sum + (room.maxAdults || 0), 0),
    children: rooms.reduce((sum, room) => sum + (room.maxChildren || 0), 0),
  };

  const canAccommodate = (() => {
    if (rooms.length === 0) return false;

    let remainingAdults = totalGuests.adults;
    let remainingChildren = totalGuests.children;

    const sortedRooms = [...rooms].sort((a, b) => {
      const aCap = a.capacity?.maxAdults ?? a.maxAdults ?? 0;
      const bCap = b.capacity?.maxAdults ?? b.maxAdults ?? 0;
      return bCap - aCap;
    });

    for (const room of sortedRooms) {
      const maxAdults = room.capacity?.maxAdults ?? room.maxAdults ?? 0;
      const maxChildren = room.capacity?.maxChildren ?? room.maxChildren ?? 0;
      const maxTotal = room.capacity?.maxTotal ?? (maxAdults + maxChildren);

      let useAdults = Math.min(remainingAdults, maxAdults);
      remainingAdults -= useAdults;

      let useChildren = Math.min(remainingChildren, maxChildren);
      remainingChildren -= useChildren;

      const totalInRoom = useAdults + useChildren;

      if (
        remainingChildren > 0 &&
        totalInRoom < maxTotal
      ) {
        const extra = Math.min(maxTotal - totalInRoom, remainingChildren);
        remainingChildren -= extra;
      }
    }

   

    return remainingAdults <= 0 && remainingChildren <= 0;
  })();

  const [localAdults, setLocalAdults] = useState(totalGuests.adults);
  const [localChildren, setLocalChildren] = useState(totalGuests.children);

  useEffect(() => {
    const updateGuestCount = () => {
      const storedAdults = localStorage.getItem('selectedAdults');
      const storedChildren = localStorage.getItem('selectedChildren');

      if (storedAdults !== null) setLocalAdults(parseInt(storedAdults, 10));
      if (storedChildren !== null) setLocalChildren(parseInt(storedChildren, 10));
    };

    updateGuestCount(); // call once on mount
    window.addEventListener('storage', updateGuestCount);
    window.addEventListener('localStorageUpdated', updateGuestCount);

    return () => {
      window.removeEventListener('storage', updateGuestCount);
      window.removeEventListener('localStorageUpdated', updateGuestCount);
    };
  }, []);

  if (!property) {
    return (
      <div className="rounded-2xl bg-white p-4 w-full max-w-2xl mx-auto space-y-3">
        <SkeletonBlock className="h-6 w-1/2" />
        <SkeletonBlock className="h-5 w-3/4" />
        <SkeletonBlock className="h-5 w-full" />
        <SkeletonBlock className="h-20 w-full" />
        <SkeletonBlock className="h-5 w-1/2" />
        <SkeletonBlock className="h-5 w-3/4" />
        <SkeletonBlock className="h-5 w-2/3" />
      </div>
    );
  }

  return (
    <div key={refreshKey} className="rounded-2xl bg-white p-4 w-full max-w-2xl mx-auto space-y-2">
      <div className="px-0 py-1 space-y-2">
        {/* Hotel Name + Thumbnail */}
        <div className="flex items-start gap-4">
          <div className="flex-1">
            <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wide leading-snug">
              {property?.name || "Hotel Name"}
            </h2>
            <div className="flex items-center gap-1 text-sm text-gray-500 mt-1">
              <span className="flex items-center gap-1">
                Hotels {property?.hotelStarRating || "5"}
                <StarsLayout count={property?.hotelStarRating || 0} />
              </span>
              <button onClick={() => setShowReviewModal(true)} className="text-blue-600 underline ml-1">
                see reviews
              </button>
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Check-in {property?.policy?.checkIn || "2:00 PM"} • Check-out {property?.policy?.checkOut || "12:00 PM"}
            </div>
          </div>
          <img 
            src={property?.images?.[0] || ""}
            alt="Hotel Thumbnail"
            className="w-16 h-16 rounded-md object-cover"
          />
        </div>

        {/* Dates and Guests */}
        <div className="border-t border-gray-200 pt-2 space-y-1 text-sm text-gray-600">
          <div className="flex justify-between">
            <span>
              <CalendarDays className="w-4 h-4 inline mr-1" />
              {new Date(dateRange.startDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })} → {new Date(dateRange.endDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
            </span>
            <span>{nights} {nights > 1 ? "nights" : "night"}</span>
          </div>
          <div className="flex items-center gap-2">
            <span>
              <User className="w-4 h-4 inline mr-1" />
              {totalGuests.adults} adults
              {totalGuests.children > 0 && `, ${totalGuests.children} ${totalGuests.children > 1 ? "children" : "child"}`}
            </span>
          </div>
        </div>

       {/* Room Details */}
        {rooms.map((room, idx) => {
          const roomKey = room.instanceId || `${room._id || room.id || 'room'}-${idx}`;
          return (
            <SelectedRoomCard
              key={roomKey}
              room={room}
              onRemove={location.pathname !== "/confirmation" ? () => {
                removeRoom(roomKey);
              } : undefined}
              loadingRate={loadingRate}
            />
          );
        })}

        {/* Selected Services */}
        {selectedServices.map((service, idx) => {
          const key = service.id || `${service._id || 'service'}-${idx}`;
          return (
            <SelectedServiceCard
              key={key}
              service={service}
              onRemove={location.pathname !== "/confirmation" ? () => {
                removeService(key);
              } : undefined}
            />
          );
        })}

        {/* Total Section */}
        <div className="border-t border-gray-300 pt-2">
          <div className="text-xs text-gray-400 mb-1">
            <span className="font-bold text-sm text-gray-800">TOTAL</span> (fees and taxes included)
          </div>
          <div className="text-right space-y-1 text-sm text-gray-700">
            <div className="flex justify-between">
              <span>Subtotal (excl. VAT)</span>
              <span>{formatCurrency(totalBeforeTax - totalVat, exchangeRate, currency)}</span>
            </div>
            <div className="flex justify-between">
              <span>Includes VAT</span>
              <span>{formatCurrency(totalVat, exchangeRate, currency)}</span>
            </div>
            <div className="flex justify-between font-bold text-green-700 text-base border-t pt-1 border-gray-300">
              <span>Total (incl. tax)</span>
              <span>{formatCurrency(totalPrice, exchangeRate, currency)}</span>
            </div>
          </div>
        </div>

        {/* Continue Button */}
        <div>
          {!location.pathname.includes("/modify-reservation") && location.pathname !== "/guest-info" && location.pathname !== "/confirmation" && (
            <button
              onClick={() => {
                if (rooms.length === 0) {
                  setErrorMessage("Please select a room.");
                  return;
                }
                if (!canAccommodate) {
                  const totalCount = totalGuests.adults + totalGuests.children;
                  setErrorMessage(`Please add more room(s) to accommodate ${totalCount} guest${totalCount > 1 ? "s" : ""}`);
                  return;
                }
                const hasUnavailableRoom = rooms.some(room => room.unavailable);
                if (hasUnavailableRoom) {
                  setErrorMessage("One or more selected rooms are unavailable. Please remove them before continuing.");
                  return;
                }
                setErrorMessage("");
                if (property) {
                  localStorage.setItem("selectedHotel", JSON.stringify(property));
                }
                navigate(nextPath);
              }}
              className={`mt-4 w-full py-3 rounded-full font-semibold text-white transition ${
                location.pathname === "/confirmation"
                  ? "bg-[#8B6F4E] hover:bg-[#7a5f42] h-14"
                  : "bg-[#8B6F4E] hover:bg-[#7a5f42]"
              }`}
            >
              Continue
            </button>
          )}
          {errorMessage && (
            <div className="mt-2 text-sm text-red-600 text-center">{errorMessage}</div>
          )}
        </div>
      </div>
      {showReviewModal && property && (
        <ReviewModal
          isOpen={showReviewModal}
          onClose={() => setShowReviewModal(false)}
          propertyId={property._id}
          property={property}
        />
      )}
    </div>
  );
};

export default PriceSummary;