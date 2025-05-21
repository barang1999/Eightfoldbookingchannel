import { useState, useEffect } from 'react';
import { useSelectedRooms } from "../contexts/SelectedRoomsContext";
import { refreshAllRoomRates } from '../utils/rateRefresher';
import {DateRangePickerBox} from './DateRangePicker';
import { useSelectedDate } from '../contexts/SelectedDateContext';
import MobileDateFullScreenModal from './MobileDateFullScreenModal';
import { motion, AnimatePresence } from 'framer-motion';

export default function MobileBookingModal(props) {
  const {
    roomData = [],
    setRoomData = () => {},
    onClose = () => {},
    handleSearchDate = () => {},
  } = props;
  const { dateRange, updateDateRange } = useSelectedDate();
  const { updateRoomsAfterRateRefresh } = useSelectedRooms();

  const [loadingRates, setLoadingRates] = useState(false);

  // Load dateRange from localStorage if available
  useEffect(() => {
    const savedRange = localStorage.getItem('selectedBookingDateRange');
    if (savedRange) {
      try {
        const parsedRange = JSON.parse(savedRange);
        if (parsedRange.startDate && parsedRange.endDate) {
          updateDateRange(new Date(parsedRange.startDate), new Date(parsedRange.endDate));
        }
      } catch (e) {
        console.error('Failed to parse saved booking date range', e);
      }
    }
  }, []);
  const [showFullScreenDate, setShowFullScreenDate] = useState(false);

  useEffect(() => {
    const savedRange = localStorage.getItem('selectedBookingDateRange');
    const expiry = localStorage.getItem('dateExpiry');
    const now = new Date().getTime();
  
    if (
      savedRange &&
      expiry &&
      now < parseInt(expiry) &&
      (!dateRange?.startDate || !dateRange?.endDate)
    ) {
      try {
        const parsedRange = JSON.parse(savedRange);
        if (parsedRange.startDate && parsedRange.endDate) {
          updateDateRange(new Date(parsedRange.startDate), new Date(parsedRange.endDate));
        }
      } catch (e) {
        console.error('Failed to parse saved booking date range', e);
      }
    }
  }, []);

useEffect(() => {
  if (
    !dateRange.startDate ||
    !dateRange.endDate ||
    isNaN(new Date(dateRange.startDate).getTime()) ||
    isNaN(new Date(dateRange.endDate).getTime())
  ) {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    updateDateRange(today, tomorrow);
    localStorage.setItem('selectedBookingDateRange', JSON.stringify({ startDate: today, endDate: tomorrow }));
  }
}, []);

useEffect(() => {
  const handleLocalStorageUpdate = async () => {
    const updatedSaved = localStorage.getItem('bookingRoomData');
    const startDate = localStorage.getItem('selectedStartDate');
    const endDate = localStorage.getItem('selectedEndDate');
    const includeBreakfast = localStorage.getItem('includeBreakfast') === 'true';

    if (updatedSaved && startDate && endDate) {
      try {
        const parsed = JSON.parse(updatedSaved);
        if (parsed && Array.isArray(parsed.data)) {
          // 🔄 Refresh each room's rate
          const refreshedRooms = await refreshAllRoomRates(
            parsed.data,
            { startDate, endDate },
            includeBreakfast
          );
          setRoomData(refreshedRooms);
        }
      } catch (e) {
        console.error('Failed to parse or refresh room data', e);
      }
    }
  };

  window.addEventListener('localStorageUpdated', handleLocalStorageUpdate);
  return () => {
    window.removeEventListener('localStorageUpdated', handleLocalStorageUpdate);
  };
}, []);

  const handleAddRoom = () => {
    const updatedRooms = [
      ...roomData,
      {
        roomType: "standard",
        roomId: "6807aef667b5b3fd0fe4f506",
        propertyId: import.meta.env.VITE_DEFAULT_PROPERTY_ID,
        adults: 1,
        children: 0,
        childrenAges: [],
      },
    ];
    setRoomData(updatedRooms);
    localStorage.setItem(
      'bookingRoomData',
      JSON.stringify({
        data: updatedRooms,
        timestamp: Date.now(),
      })
    );
    localStorage.setItem('selectedBookingDateRange', JSON.stringify(dateRange));
  };

  const handleRemoveRoom = (index) => {
    if (roomData.length > 1) {
      const updatedRooms = roomData.filter((_, i) => i !== index);
      setRoomData(updatedRooms);
      localStorage.setItem(
        'bookingRoomData',
        JSON.stringify({
          data: updatedRooms,
          timestamp: Date.now(),
        })
      );
    }
  };

  const updateRoom = (index, field, value) => {
    const updatedRooms = roomData.map((room, i) => {
      if (i !== index) return room;
      if (field) {
        return { ...room, [field]: value };
      } else if (typeof value === 'object') {
        return { ...room, ...value };
      }
      return room;
    });

    setRoomData(updatedRooms);
    localStorage.setItem(
      'bookingRoomData',
      JSON.stringify({
        data: updatedRooms,
        timestamp: Date.now(),
      })
    );
    localStorage.setItem('selectedBookingDateRange', JSON.stringify(dateRange));

    // Dispatch update event
    window.dispatchEvent(new Event('localStorageUpdated'));
  };

  const handleSearchClick = async () => {
    const totalAdults = roomData.reduce((sum, room) => sum + room.adults, 0);
    const totalChildren = roomData.reduce((sum, room) => sum + room.children, 0);

    localStorage.setItem('searchGuests', JSON.stringify(roomData));
    localStorage.setItem('selectedAdults', totalAdults.toString());
    localStorage.setItem('selectedChildren', totalChildren.toString());
    // ✅ Add for guest summary compatibility
    localStorage.setItem('numAdults', totalAdults.toString());
    localStorage.setItem('numChildren', totalChildren.toString());

    // Save selected date range directly in localStorage for cross-component usage
    if (dateRange.startDate && dateRange.endDate) {
      localStorage.setItem('selectedStartDate', new Date(dateRange.startDate).toISOString());
      localStorage.setItem('selectedEndDate', new Date(dateRange.endDate).toISOString());
      window.dispatchEvent(new Event("localStorageUpdated"));
    }

    // Compute the number of nights and store in localStorage
    const nights = Math.round(
      (new Date(dateRange.endDate) - new Date(dateRange.startDate)) / (1000 * 60 * 60 * 24)
    );
    localStorage.setItem('selectedNights', nights.toString());

    // Sync selected date to context
    updateDateRange(dateRange.startDate, dateRange.endDate);
    // ➕ Trigger desktop-style refresh logic
    window.dispatchEvent(new Event("triggerRoomRefresh"));

    // Sync selected room pricing and VAT from backend to mobile-selected summary UI
    if (typeof refreshSelectedRooms === "function") {
      const updatedSelectedRooms = await refreshSelectedRooms(
        roomData,
        {
          startDate: dateRange.startDate,
          endDate: dateRange.endDate
        },
        localStorage.getItem("includeBreakfast") === "true"
      );
      updateRoomsAfterRateRefresh(updatedSelectedRooms);
    }

    if (typeof handleSearchDate === "function") {
      const start = localStorage.getItem("selectedStartDate");
      const end = localStorage.getItem("selectedEndDate");

      await handleSearchDate({
        startDate: new Date(start),
        endDate: new Date(end)
      });
    }

    // Enrich roomData with roomId and propertyId before refreshing rates
    const enrichedRoomData = roomData.map(room => ({
      ...room,
      roomId: room.roomId || room._id,
      propertyId: room.propertyId || import.meta.env.VITE_DEFAULT_PROPERTY_ID
    }));

    const refreshedRooms = await refreshAllRoomRates(
      enrichedRoomData,
      {
        startDate: new Date(dateRange.startDate).toISOString(),
        endDate: new Date(dateRange.endDate).toISOString()
      },
      localStorage.getItem("includeBreakfast") === "true"
    );
    setRoomData(refreshedRooms);
    localStorage.setItem('bookingRoomData', JSON.stringify({ data: refreshedRooms, timestamp: Date.now() }));
    window.dispatchEvent(new Event('localStorageUpdated'));

    onClose();
  };

  // Refresh room rates on first load if valid localStorage data exists
  useEffect(() => {
    const saved = localStorage.getItem('bookingRoomData');
    const start = localStorage.getItem('selectedStartDate');
    const end = localStorage.getItem('selectedEndDate');
    const breakfast = localStorage.getItem('includeBreakfast') === 'true';

    if (saved && start && end) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed.data)) {
          const enrichedRooms = parsed.data.map(room => ({
            ...room,
            roomId: room.roomId || room._id,
            propertyId: room.propertyId || import.meta.env.VITE_DEFAULT_PROPERTY_ID
          }));
          setLoadingRates(true);
          refreshAllRoomRates(
            enrichedRooms,
            { startDate: start, endDate: end },
            breakfast
          ).then(refreshed => {
            setRoomData(refreshed);
            localStorage.setItem('bookingRoomData', JSON.stringify({ data: refreshed }));
            // Dispatch a custom event to ensure Home.jsx fetches updated rooms
            window.dispatchEvent(new Event("triggerRoomRefresh"));
            // Also trigger handleSearchDate for mobile, just like on desktop
            if (typeof handleSearchDate === "function") {
              handleSearchDate({
                startDate: new Date(start),
                endDate: new Date(end)
              });
            }
          }).finally(() => setLoadingRates(false));
        }
      } catch (e) {
        console.error('Failed to refresh rates after reload:', e);
        setLoadingRates(false);
      }
    }
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
      {loadingRates && (
        <div className="absolute inset-0 bg-white bg-opacity-80 z-50 flex items-center justify-center">
          <span className="text-gray-800 font-semibold text-lg">Refreshing rates...</span>
        </div>
      )}
      <AnimatePresence>
        <motion.div
          className="bg-white rounded-lg w-[90%] max-w-md max-h-[90vh] overflow-y-auto flex flex-col"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
        >
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Book Your Stay</h2>
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="text-gray-700 hover:text-gray-900"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              viewBox="0 0 24 24"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 flex-grow flex flex-col gap-6">
          {/* Date Range Selector */}
          <div>
            <label className="block text-gray-800 font-medium mb-2">Select Dates</label>
            <button
              type="button"
              onClick={() => setShowFullScreenDate(true)}
              className="w-full flex justify-between items-center px-4 py-3 border border-gray-300 rounded text-gray-700 text-sm hover:border-gray-500 focus:outline-none focus:ring-2 focus:ring-[#8a6b41]"
            >
              <span>
              {dateRange.startDate
                ? (dateRange.startDate instanceof Date
                    ? dateRange.startDate
                    : new Date(dateRange.startDate)
                  ).toLocaleDateString()
                : 'Start Date'}
              {dateRange.endDate
                ? ' → ' + (dateRange.endDate instanceof Date
                    ? dateRange.endDate
                    : new Date(dateRange.endDate)
                  ).toLocaleDateString()
                : ''}
              </span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-gray-600"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                viewBox="0 0 24 24"
              >
                <path d="M8 7V3M16 7V3M3 11h18M5 21h14a2 2 0 002-2v-7H3v7a2 2 0 002 2z" />
              </svg>
            </button>
          </div>

          {/* Rooms & Guests */}
          <div>
            <label className="block text-gray-800 font-medium mb-3">Rooms & Guests</label>
            <div className="space-y-6">
              {Array.isArray(roomData) && roomData.map((room, index) => (
                <div
                  key={index}
                  className="border border-gray-300 rounded p-4 relative"
                >
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-xs font-semibold text-gray-500">
                      ROOM {index + 1}
                    </span>
                    {roomData.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveRoom(index)}
                        className="text-xs text-red-600 underline hover:text-red-800"
                      >
                        Remove
                      </button>
                    )}
                  </div>

                  {/* Adults */}
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-gray-800 font-medium">Adult(s)</span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          const updatedRooms = roomData.map((room, i) =>
                            i === index ? { ...room, adults: Math.max(1, room.adults - 1) } : room
                          );
                          setRoomData(updatedRooms);
                          localStorage.setItem('bookingRoomData', JSON.stringify({ data: updatedRooms, timestamp: Date.now() }));
                          window.dispatchEvent(new Event('localStorageUpdated'));
                        }}
                        className="w-8 h-8 border border-gray-300 rounded text-lg text-gray-700 flex items-center justify-center hover:bg-gray-100"
                        aria-label={`Decrease adults in room ${index + 1}`}
                      >
                        –
                      </button>
                      <span className="w-6 text-center text-gray-900">{room.adults}</span>
                      <button
                        type="button"
                        onClick={() => {
                          const updatedRooms = roomData.map((room, i) =>
                            i === index ? { ...room, adults: room.adults + 1 } : room
                          );
                          setRoomData(updatedRooms);
                          localStorage.setItem('bookingRoomData', JSON.stringify({ data: updatedRooms, timestamp: Date.now() }));
                          window.dispatchEvent(new Event('localStorageUpdated'));
                        }}
                        className="w-8 h-8 border border-gray-300 rounded text-lg text-gray-700 flex items-center justify-center hover:bg-gray-100"
                        aria-label={`Increase adults in room ${index + 1}`}
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Children */}
                  <div className="flex justify-between items-center">
                    <span className="text-gray-800 font-medium">Child(ren)</span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          const updatedRooms = roomData.map((room, i) => {
                            if (i !== index) return room;
                            const newChildren = Math.max(0, room.children - 1);
                            return { ...room, children: newChildren, childrenAges: (room.childrenAges || []).slice(0, newChildren) };
                          });
                          setRoomData(updatedRooms);
                          localStorage.setItem('bookingRoomData', JSON.stringify({ data: updatedRooms, timestamp: Date.now() }));
                          window.dispatchEvent(new Event('localStorageUpdated'));
                        }}
                        className="w-8 h-8 border border-gray-300 rounded text-lg text-gray-700 flex items-center justify-center hover:bg-gray-100"
                        aria-label={`Decrease children in room ${index + 1}`}
                      >
                        –
                      </button>
                      <span className="w-6 text-center text-gray-900">{room.children}</span>
                      <button
                        type="button"
                        onClick={() => {
                          const updatedRooms = roomData.map((room, i) => {
                            if (i !== index) return room;
                            const newChildren = room.children + 1;
                            return { ...room, children: newChildren, childrenAges: [...(room.childrenAges || []), 0] };
                          });
                          setRoomData(updatedRooms);
                          localStorage.setItem('bookingRoomData', JSON.stringify({ data: updatedRooms, timestamp: Date.now() }));
                          window.dispatchEvent(new Event('localStorageUpdated'));
                        }}
                        className="w-8 h-8 border border-gray-300 rounded text-lg text-gray-700 flex items-center justify-center hover:bg-gray-100"
                        aria-label={`Increase children in room ${index + 1}`}
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {room.children > 0 && (
                    <div className="mt-4 space-y-3">
                      {Array.isArray(room.childrenAges) && room.childrenAges.map((age, childIndex) => (
                        <div key={childIndex} className="flex items-center justify-between">
                          <label className="text-gray-700 text-sm">Age child {childIndex + 1}</label>
                          <select
                            value={age}
                            onChange={(e) =>
                              updateRoom(index, null, {
                                childrenAges: room.childrenAges.map((a, idx) =>
                                  idx === childIndex ? parseInt(e.target.value) : a
                                ),
                              })
                            }
                            className="border border-gray-300 rounded px-3 py-2 text-gray-800 text-sm"
                          >
                            {Array.from({ length: 18 }, (_, i) => (
                              <option key={i} value={i}>
                                {i} years
                              </option>
                            ))}
                          </select>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              <button
                type="button"
                onClick={handleAddRoom}
                className="flex items-center gap-2 text-[#8a6b41] font-semibold text-sm hover:underline"
              >
                <span className="text-lg leading-none">＋</span> Add a room
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200">
          <motion.button
            type="button"
            onClick={handleSearchClick}
            whileTap={{ scale: 0.95 }}
            className="w-full bg-[#8a6b41] text-white py-3 rounded text-lg font-semibold hover:bg-[#705847] transition"
          >
            {window.location.pathname.includes("modify") ? "Submit" : "Search"}
          </motion.button>
        </div>
        </motion.div>
      </AnimatePresence>
      {showFullScreenDate && (
        <MobileDateFullScreenModal onClose={() => setShowFullScreenDate(false)} />
      )}
    </div>
  );
}