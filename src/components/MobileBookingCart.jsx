import { useSelectedServices } from '../contexts/SelectedServicesContext';
import { useSelectedRooms } from '../contexts/SelectedRoomsContext';
import React, { useState, useEffect } from 'react';
import { useCurrency } from '../contexts/CurrencyProvider';
import { formatCurrency } from '../utils/formatCurrency';
import { useNavigate, useLocation } from 'react-router-dom';

const MobileBookingCart = ({ nights, onContinue, onExpand, property }) => {
  const { selectedRooms } = useSelectedRooms();
  const { selectedServices } = useSelectedServices();
  const { exchangeRate = 1, currency: currencyCode = 'USD' } = useCurrency() || {};
  const [errorMessage, setErrorMessage] = useState("");
  const [localAdults, setLocalAdults] = useState(0);
  const [localChildren, setLocalChildren] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();
  const pathSequence = ["/", "/guest-info", "/payment", "/confirmation"];
  const currentPath = location.pathname;
  const currentIndex = pathSequence.indexOf(currentPath);
  const nextPath = pathSequence[currentIndex + 1] || "/confirmation";

  const vatPercentage = parseFloat(localStorage.getItem('vatPercentage') || '10');

  useEffect(() => {
    const storedAdults = localStorage.getItem('selectedAdults');
    const storedChildren = localStorage.getItem('selectedChildren');
    if (storedAdults) setLocalAdults(parseInt(storedAdults, 10));
    if (storedChildren) setLocalChildren(parseInt(storedChildren, 10));
  }, []);

  useEffect(() => {
    const handleStorageChange = () => {
      const updatedAdults = parseInt(localStorage.getItem('selectedAdults') || "0", 10);
      const updatedChildren = parseInt(localStorage.getItem('selectedChildren') || "0", 10);
      setLocalAdults(updatedAdults);
      setLocalChildren(updatedChildren);
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const calculateGuestAllocation = () => {
    let remainingAdults = localAdults;
    let remainingChildren = localChildren;

    const sortedRooms = [...selectedRooms].sort((a, b) => {
      const aAdults = a.maxAdults || 0;
      const bAdults = b.maxAdults || 0;
      return bAdults - aAdults; // prioritize rooms with more adult capacity
    });

    for (const room of sortedRooms) {
      const maxAdults = room.maxAdults || 0;
      const maxChildren = room.maxChildren || 0;
      const maxTotal = room.maxTotal || (maxAdults + maxChildren);

      const useAdults = Math.min(maxAdults, remainingAdults);
      remainingAdults -= useAdults;

      const useChildren = Math.min(maxChildren, remainingChildren);
      remainingChildren -= useChildren;

      const totalInRoom = useAdults + useChildren;

      if (
        remainingChildren > 0 &&
        useAdults >= 1 &&
        totalInRoom < maxTotal
      ) {
        const remainingSpace = maxTotal - totalInRoom;
        const allowedExtraChildren = Math.min(remainingChildren, remainingSpace);
        remainingChildren -= allowedExtraChildren;
      }
    }

    console.log("📊 Guest Allocation Debug — Remaining:", {
      remainingAdults,
      remainingChildren,
      localAdults,
      localChildren,
      selectedRooms
    });

    return { remainingAdults, remainingChildren };
  };

  const { remainingAdults, remainingChildren } = calculateGuestAllocation();
  const canAccommodate = remainingAdults <= 0 && remainingChildren <= 0;

  const totalRoomPrice = selectedRooms.reduce((sum, room) => sum + (room.price || 0), 0);
  const totalServicePrice = selectedServices.reduce((sum, service) => sum + (service.price || 0), 0);
  const totalVAT =
    selectedRooms.reduce((sum, room) => {
      const price = room.price || 0;
      return sum + price * (10 / 110);
    }, 0) +
    selectedServices.reduce((sum, service) => {
      const price = service.price || 0;
      return sum + (typeof service.vat === 'number' ? service.vat : price * (10 / 110));
    }, 0);
  // Grand total is already VAT-inclusive, do not add totalVAT again
  const grandTotal = totalRoomPrice + totalServicePrice; // already includes VAT
  const grandTotalFormatted = formatCurrency(grandTotal, exchangeRate, currencyCode);

  return (
    <div className="fixed bottom-0 w-full z-40 bg-white border-t shadow-md sm:hidden">
      <div className="p-2">
        <div className="flex justify-center mb-2">
          <button
            onClick={onExpand}
            className="text-gray-400 hover:text-gray-600 transition-all"
            aria-label="Expand Cart"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
            </svg>
          </button>
        </div>
        <div className="flex items-center justify-between mb-2">
          <div className="text-sm font-bold text-gray-900">TOTAL <span className="font-normal text-gray-500">(including VAT)</span></div>
          <div className="text-green-700 font-bold text-lg">
            {grandTotalFormatted}
          </div>
        </div>
        <button
          onClick={() => {
            if (!selectedRooms || selectedRooms.length === 0) {
              setErrorMessage("Please select a room before continuing.");
              return;
            }
            console.log("🚫 Cannot proceed — Incomplete allocation", {
              remainingAdults,
              remainingChildren,
              localAdults,
              localChildren
            });
            const latestAdults = parseInt(localStorage.getItem('selectedAdults') || "0", 10);
            const latestChildren = parseInt(localStorage.getItem('selectedChildren') || "0", 10);
            setLocalAdults(latestAdults);
            setLocalChildren(latestChildren);

            const latestTotalGuests = latestAdults + latestChildren;
            if (remainingAdults > 0 || remainingChildren > 0) {
              setErrorMessage(`Add more room(s) to fit ${latestTotalGuests} guest${latestTotalGuests > 1 ? "s" : ""}.`);
              return;
            }
            if (property) {
              localStorage.setItem("selectedHotel", JSON.stringify(property));
            }
            setErrorMessage("");
            navigate(nextPath);
          }}
          className="mt-2 w-full bg-[#8B6F4E] hover:bg-[#7a5f42] text-white font-bold py-2 rounded-full transition-all duration-200"
        >
          Continue
        </button>
        {errorMessage && (
          <div className="mt-2 text-sm text-red-600 text-center">{errorMessage}</div>
        )}
      </div>
    </div>
  );
};

export default MobileBookingCart;