import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { CalendarDays, User, Check } from "lucide-react"; // optional icons
import SelectedRoomCard from './SelectedRoomCard';
import ModifyRoomSummaryCard from './ModifyRoomSummaryCard';
import { useSelectedRooms } from "../contexts/SelectedRoomsContext";
import { formatCurrency } from '../utils/formatCurrency';
import { useCurrency } from '../contexts/CurrencyProvider';
import { useNavigate } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import { useSelectedServices } from '../contexts/SelectedServicesContext';
import SelectedServiceCard from './SelectedServiceCard';

const ModifyMobilePriceSummary = ({
  nights = 1,
  onConfirm = () => {},
  selectedRooms = [],
  totalPrice = 0,
  startDate,
  endDate,
  totalAdults = 0,
  totalChildren = 0,
  onRemoveRoom = () => {},
  onCloseDetails = () => {}
}) => {
  const { selectedRooms: selectedRoomsCtx, removeRoom, setSelectedRooms } = useSelectedRooms();
  const navigate = useNavigate();
  const location = useLocation();
  const pathSequence = ["/", "/guest-info", "/payment", "/confirmation"];
  const currentPath = location.pathname;
  const currentIndex = pathSequence.indexOf(currentPath);
  const nextPath = pathSequence[currentIndex + 1] || "/confirmation";
  // Restore selectedRooms from localStorage on mount (mobile reload)
  useEffect(() => {
    // Add modal-active class to body when this modal mounts
    document.body.classList.add('modal-active');
    // Restore selectedRooms from localStorage on mount (mobile reload)
    const storedSelectedRooms = localStorage.getItem("selectedRooms");
    if (storedSelectedRooms) {
      try {
        const parsed = JSON.parse(storedSelectedRooms);
        if (Array.isArray(parsed)) {
          if (typeof setSelectedRooms === "function") {
            setSelectedRooms(parsed);
          }
        }
      } catch (err) {
        console.warn("Failed to restore selectedRooms from localStorage", err);
      }
    }
    return () => {
      // Remove modal-active class from body when modal unmounts
      document.body.classList.remove('modal-active');
    };
  }, []);
  const [hotel, setHotel] = useState({});
  const [property, setProperty] = useState({});
  const [showCartDetails, setShowCartDetails] = useState(false);

  const [localStartDate, setLocalStartDate] = useState(startDate);
  const [localEndDate, setLocalEndDate] = useState(endDate);
  const [localAdults, setLocalAdults] = useState(totalAdults);
  const [localChildren, setLocalChildren] = useState(totalChildren);

  const [errorMessage, setErrorMessage] = useState("");
  const { exchangeRate = 1, currency: currencyCode = 'USD' } = useCurrency() || {};
  const { selectedServices } = useSelectedServices();

  useEffect(() => {
    const storedHotel = JSON.parse(localStorage.getItem('selectedHotel'));
    setHotel(storedHotel || {});

    const storedStartDate = localStorage.getItem('selectedStartDate');
    const storedEndDate = localStorage.getItem('selectedEndDate');
    const storedAdults = localStorage.getItem('selectedAdults');
    const storedChildren = localStorage.getItem('selectedChildren');
    if (storedStartDate) setLocalStartDate(storedStartDate);
    if (storedEndDate) setLocalEndDate(storedEndDate);
    if (storedAdults) setLocalAdults(parseInt(storedAdults, 10));
    if (storedChildren) setLocalChildren(parseInt(storedChildren, 10));

    const handleStorageChange = () => {
      const updatedStartDate = localStorage.getItem('selectedStartDate');
      const updatedEndDate = localStorage.getItem('selectedEndDate');
      const updatedAdults = localStorage.getItem('selectedAdults');
      const updatedChildren = localStorage.getItem('selectedChildren');
      if (updatedStartDate) setLocalStartDate(updatedStartDate);
      if (updatedEndDate) setLocalEndDate(updatedEndDate);
      if (updatedAdults !== null) setLocalAdults(parseInt(updatedAdults, 10));
      if (updatedChildren !== null) setLocalChildren(parseInt(updatedChildren, 10));
    };
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('localStorageUpdated', handleStorageChange);

    // Fetch property info using propertyId from storedHotel (not from selectedPropertyId)
    const fetchProperty = async () => {
      const storedHotel = JSON.parse(localStorage.getItem('selectedHotel'));
      const propertyId = storedHotel?.propertyId || storedHotel?._id;
      if (!propertyId) {
        console.warn("❗ propertyId is undefined — storedHotel:", storedHotel);
        return;
      }

      try {
        const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/property?propertyId=${propertyId}`);
        setProperty(res.data);
      } catch (err) {
        console.error("Failed to fetch property info", err);
      }
    };
    fetchProperty();

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('localStorageUpdated', handleStorageChange);
    };
  }, []);

  useEffect(() => {
    if (startDate) setLocalStartDate(startDate);
    if (endDate) setLocalEndDate(endDate);

    const storedAdults = localStorage.getItem('selectedAdults');
    const storedChildren = localStorage.getItem('selectedChildren');

    if (totalAdults > 0) {
      setLocalAdults(totalAdults);
      localStorage.setItem('selectedAdults', totalAdults);
    } else if (storedAdults) {
      setLocalAdults(parseInt(storedAdults, 10));
    }

    if (totalChildren > 0) {
      setLocalChildren(totalChildren);
      localStorage.setItem('selectedChildren', totalChildren);
    } else if (storedChildren) {
      setLocalChildren(parseInt(storedChildren, 10));
    }
  }, [startDate, endDate, totalAdults, totalChildren]);

  const safeSelectedRooms = selectedRoomsCtx;
  // --- VAT and Total Calculation (refactored for accuracy, see TotalWithVatSummary.jsx) ---
  // Subtotal: sum base rates for rooms and prices for services
  const subtotal =
    safeSelectedRooms.reduce((acc, room) => {
      const baseRate = Number(room.baseRate || room.price || 0);
      return acc + baseRate;
    }, 0) +
    (selectedServices?.reduce((acc, s) => Number(s?.price) || 0, 0) || 0);

  // VAT rate: prefer property policy, fallback to localStorage
  const vatRate =
    property?.policy?.vat?.percentage ||
    parseFloat(localStorage.getItem('vatPercentage') || '0');
  // New VAT calculation: VAT included in subtotal
  const computedVat = subtotal * vatRate / (100 + vatRate);
  const computedTotalPrice = subtotal; // Already includes VAT

  // Logging for verification
  console.log("✅ Recalculated Subtotal:", subtotal);
  console.log("✅ VAT Rate:", vatRate);
  console.log("✅ Recalculated Total:", computedTotalPrice);

  // Calculate nights based on localStartDate and localEndDate
  const computedNights = localStartDate && localEndDate
    ? Math.ceil((new Date(localEndDate) - new Date(localStartDate)) / (1000 * 60 * 60 * 24))
    : 0;

  const selectedTotalGuests = {
    adults: safeSelectedRooms.reduce((sum, room) => sum + (room.maxAdults || 0), 0),
    children: safeSelectedRooms.reduce((sum, room) => sum + (room.maxChildren || 0), 0),
  };

  const canAccommodate =
    selectedTotalGuests.adults >= localAdults &&
    selectedTotalGuests.children >= localChildren;

  return (
    <div className="fixed inset-0 bg-black/30 z-[50] sm:hidden flex flex-col">
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="bg-white rounded-t-2xl p-6 relative flex flex-col h-full overflow-y-auto z-[60]"
      >
        {/* Close Button */}
        <button
          onClick={() => {
            console.log("❌ Close button clicked");
            onCloseDetails();
          }}
          className="absolute right-4 top-4 border border-gray-300 rounded-md px-2 py-1 text-gray-600 hover:bg-gray-100 hover:scale-105 transition-all duration-200"
          aria-label="Close"
        >
          ✕
        </button>

        {/* Header */}
        <h2 className="text-2xl font-bold mb-4">Your Stay</h2>

        {/* Hotel Profile */}
        <div className="flex justify-between items-center mb-6">
  <div className="flex flex-col flex-1 pr-4">

    <div className="text-sm font-bold text-gray-900">{hotel.name || "EIGHTFOLD URBAN"}</div>
    <div className="text-xs text-gray-500 font-semibold tracking-wide uppercase">Hotels {property?.hotelStarRating || 4}</div>
    <div className="flex items-center space-x-1 text-sm text-gray-600 mt-1">
      <div className="flex space-x-0.5">
        {[...Array(property?.hotelStarRating || 5)].map((_, i) => (
          <svg key={i} xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-[#1B1443]" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.092 3.36a1 1 0 00.95.69h3.562c.969 0 1.371 1.24.588 1.81l-2.88 2.08a1 1 0 00-.364 1.118l1.093 3.36c.3.921-.755 1.688-1.54 1.118l-2.88-2.08a1 1 0 00-1.175 0l-2.88 2.08c-.784.57-1.838-.197-1.539-1.118l1.093-3.36a1 1 0 00-.364-1.118l-2.88-2.08c-.783-.57-.38-1.81.588-1.81h3.562a1 1 0 00.95-.69l1.092-3.36z"/>
          </svg>
        ))}
      </div>
      <span className="text-xs text-gray-500 ml-2">see reviews</span>
    </div>
    <div className="flex items-center space-x-1 text-xs text-gray-600 mt-1">
      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-[#1B1443]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
      <span>
        Check-in {property?.policy?.checkIn || "14:00"} • Check-out {property?.policy?.checkOut || "12:00"}
      </span>
    </div>
  </div>
  
  <img 
    src={
      (property?.thumbnail && property.thumbnail.startsWith("http"))
        ? property.thumbnail
        : (property?.images?.[0] && property.images[0].startsWith("http"))
        ? property.images[0]
        : "https://eightfoldurban.com/default-thumbnail.jpg"
    }
    alt="Hotel Thumbnail"
    className="w-16 h-16 rounded-md object-cover"
  />
</div>

        {/* Stay Info */}
        <div className="flex flex-col space-y-2 mb-2">
          <div className="flex items-center space-x-2 text-gray-700">
            <CalendarDays className="w-5 h-5 text-gray-500" />
            <div className="text-sm font-medium">
              {(localStartDate ? new Date(localStartDate).toLocaleDateString('en-GB', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric'
                  }) : 'Check-in')}
              {' - '}
              {(localEndDate ? new Date(localEndDate).toLocaleDateString('en-GB', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric'
                  }) : 'Check-out')}
            </div>
          </div>
          <div className="flex justify-between text-sm text-gray-600">
            <div>{computedNights} {computedNights === 1 ? 'night' : 'nights'}</div>
            <div>{localAdults} {localAdults > 1 ? 'adults' : 'adult'}{localChildren > 0 ? `, ${localChildren} ${localChildren > 1 ? 'children' : 'child'}` : ''}</div>
          </div>
        </div>

        {!showCartDetails && (
          <div className="mb-4">
            <div className="flex justify-between font-medium text-gray-800 text-sm mb-1">
              <div>
                Room Total <span className="text-xs font-normal text-gray-600">(before tax)</span>
              </div>
              <div>
                {formatCurrency(
                  safeSelectedRooms.reduce((sum, r) => {
                    const base = r.baseRate || 0;
                    return sum + base;
                  }, 0),
                  exchangeRate,
                  currencyCode
                )}
              </div>
            </div>
            {(selectedServices?.reduce((sum, s) => sum + (s.price || 0), 0) || 0) > 0 && (
              <div className="flex justify-between font-medium text-gray-800 text-sm mb-1">
                <div>
                  Extra Services <span className="text-xs font-normal text-gray-600">(before tax)</span>
                </div>
                <div>
                  {formatCurrency(
                    selectedServices?.reduce((sum, s) => sum + (s.price || 0), 0) || 0,
                    exchangeRate,
                    currencyCode
                  )}
                </div>
              </div>
            )}
            <div className="flex justify-between text-sm text-gray-500 font-medium">
              <div>Includes VAT</div>
              <div>{formatCurrency(computedVat, exchangeRate, currencyCode)}</div>
            </div>
            <div className="my-4 border-t" />
          </div>
        )}

        {/* Cart Toggle */}
        <button
          type="button"
          className="flex justify-center items-center w-full text-sm font-semibold text-[#8B6F4E] mb-6 focus:outline-none"
          onClick={() => setShowCartDetails(!showCartDetails)}
          aria-expanded={showCartDetails}
        >
          <AnimatePresence mode="wait">
            <motion.span
              key={showCartDetails ? "hide" : "see"}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.3 }}
              className="block"
            >
              {showCartDetails ? 'Hide cart details' : 'See cart details'}
            </motion.span>
          </AnimatePresence>

          <motion.svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4 text-gray-500 ml-2"
            viewBox="0 0 20 20"
            fill="currentColor"
            animate={{ rotate: showCartDetails ? 180 : 0 }}
            transition={{ duration: 0.3 }}
          >
            <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 10.939l3.71-3.71a.75.75 0 111.06 1.061l-4.24 4.25a.75.75 0 01-1.06 0l-4.24-4.25a.75.75 0 01.02-1.06z" clipRule="evenodd" />
          </motion.svg>
        </button>

        <AnimatePresence mode="wait">
            {showCartDetails && (
                <motion.div
                  key="cart-details"
                  initial={{ height: 0, opacity: 0, y: 30 }}
                  animate={{ height: "auto", opacity: 1, y: 0 }}
                  exit={{ height: 0, opacity: 0, y: 30 }}
                  transition={{ type: "spring", stiffness: 180, damping: 20, mass: 0.6 }}
                  className="flex-1 mt-2 mb-6 space-y-3 px-0 py-3"
                >
                  {safeSelectedRooms.map((room, idx) => {
                    const roomKey = room.instanceId || `${room._id || room.id || 'room'}-${idx}`;
                    // Updated priceToUse logic to include baseRate as fallback
                    const priceToUse = room.price || room.displayPrice || room.baseRate;
                    const pricePerNight = (computedNights > 0 && priceToUse) ? (priceToUse / computedNights) : 0;
                    
                    return (
                      <ModifyRoomSummaryCard
                        key={roomKey}
                        room={room}
                        original={room.original || {}}
                        isNewlyAdded={room.isNewlyAdded}
                        priceChanged={room.priceChanged}
                        isUnavailable={room.unavailable}
                        exchangeRate={exchangeRate}
                        currencyCode={currencyCode}
                        nights={computedNights}
                        pricePerNight={pricePerNight}
                      />
                    );
                  })}
                  {selectedServices && selectedServices.length > 0 && (
                    <div className="space-y-1 mt-1">
                      {selectedServices.map((service) => (
                        <SelectedServiceCard key={service._id} service={service} />
                      ))}
                    </div>
                  )}
                </motion.div>
            )}
        </AnimatePresence>

        {/* Checkout Summary: TOTAL & Continue button */}
        <div className="bg-white px-1 py-1 w-full mt-auto border-t border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <div className="text-base font-bold text-gray-900">
              TOTAL <span className="font-normal text-gray-500 text-xs">(VAT included)</span>
            </div>
            <div className="text-green-700 font-extrabold text-lg">
              {formatCurrency(computedTotalPrice, exchangeRate, currencyCode)}
            </div>
          </div>
          {!location.pathname.includes("/modification-confirmation") && (
            <>
              <button
                onClick={() => {
                  if (safeSelectedRooms.length === 0) {
                    setErrorMessage("Please select a room.");
                    return;
                  }
                  if (!canAccommodate) {
                    const adultText = `${localAdults} adult${localAdults > 1 ? "s" : ""}`;
                    const childText = `${localChildren} child${localChildren > 1 ? "ren" : ""}`;
                    setErrorMessage(`Add more room(s) to fit  ${adultText}${localChildren > 0 ? ` & ${childText}` : ""}.`);
                    return;
                  }
                  setErrorMessage("");
                  localStorage.setItem("selectedRooms", JSON.stringify(safeSelectedRooms));
                  if (property) {
                    localStorage.setItem("selectedHotel", JSON.stringify(property));
                  }
                  navigate(nextPath);
                  onConfirm();
                }}
                className="w-[100%] mx-auto bg-[#8B6F4E] hover:bg-[#7a5f42] text-white font-semibold py-2 text-base rounded-full transition-all duration-200"
              >
                Continue
              </button>
              {errorMessage && (
                <div className="mt-2 text-sm text-red-600 text-center">{errorMessage}</div>
              )}
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default ModifyMobilePriceSummary;