import CalendarPopup from "../components/CalendarPopup";
import MobileBookingModal from "../components/MobileBookingModal";
import { CalendarDays } from "lucide-react";
import React, { useState, useEffect } from "react";
import GuestRoomSelector from "../components/GuestRoomSelector";
import { useMediaQuery } from 'react-responsive';
import { useSelectedDate } from "../contexts/SelectedDateContext";

const ModifyReservationFilters = ({
  checkIn,
  checkOut,
  guests,
  onCheckInChange,
  onCheckOutChange,
  onGuestsChange,
  onSearch
}) => {
  const [showCalendar, setShowCalendar] = useState(false);
  const [isMobileModalOpen, setIsMobileModalOpen] = useState(false);
  const [roomData, setRoomData] = useState([]);
  const isMobile = useMediaQuery({ maxWidth: 767 });
  const { updateDateRange } = useSelectedDate();

  useEffect(() => {
    const savedStart = localStorage.getItem("selectedStartDate");
    const savedEnd = localStorage.getItem("selectedEndDate");
    const savedAdults = localStorage.getItem("selectedAdults");
    const savedChildren = localStorage.getItem("selectedChildren");
    const savedRooms = localStorage.getItem("selectedRooms");

    if (savedStart && savedEnd) {
      onCheckInChange(new Date(savedStart));
      onCheckOutChange(new Date(savedEnd));
    }

    if (savedAdults || savedChildren) {
      onGuestsChange({
        adults: parseInt(savedAdults || "1", 10),
        children: parseInt(savedChildren || "0", 10),
        rooms: parseInt(savedRooms || "1", 10)
      });
      setRoomData([{
        adults: parseInt(savedAdults || "1", 10),
        children: parseInt(savedChildren || "0", 10)
      }]);
    }
    setIsMobileModalOpen(false);
  }, []);

  useEffect(() => {
    const update = () => {
      onCheckInChange(new Date(localStorage.getItem("selectedStartDate")));
      onCheckOutChange(new Date(localStorage.getItem("selectedEndDate")));
      onGuestsChange({
        adults: parseInt(localStorage.getItem("selectedAdults") || "1", 10),
        children: parseInt(localStorage.getItem("selectedChildren") || "0", 10),
        rooms: parseInt(localStorage.getItem("selectedRooms") || "1", 10)
      });
      setRoomData([{
        adults: parseInt(localStorage.getItem("selectedAdults") || "1", 10),
        children: parseInt(localStorage.getItem("selectedChildren") || "0", 10)
      }]);
    };

    window.triggerModifyFilterUpdate = update;
    window.addEventListener("localStorageUpdated", update);

    return () => {
      window.removeEventListener("localStorageUpdated", update);
    };
  }, []);

  // Ensure guest updates propagate to parent when updated through GuestRoomSelector
  useEffect(() => {
    if (guests && typeof guests === 'object') {
      onGuestsChange(guests);
    }
  }, [guests]);

  return (
    <div className="px-0 py-2">
      {isMobile ? (
        <div className="bg-white border rounded-xl p-4 shadow-sm text-sm text-gray-800">
          <div className="flex justify-between items-center mb-1">
            <span className="text-gray-500 flex items-center gap-2">
              <CalendarDays size={16} /> Search your stay
            </span>
            <button onClick={() => setIsMobileModalOpen(true)} className="text-blue-600 text-sm font-medium underline">
              edit
            </button>
          </div>
          <div className="text-base font-semibold">
            From {checkIn && new Date(checkIn).toLocaleDateString("en-GB", { day: "2-digit", month: "short" })} to{" "}
            {checkOut && new Date(checkOut).toLocaleDateString("en-GB", { day: "2-digit", month: "short" })}{" "}
            <span className="font-normal text-gray-600">
              ({checkIn && checkOut ? Math.round((new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24)) : 0} nights)
            </span>
          </div>
          <div className="text-base mt-1 mb-4">
            {guests?.adults > 0 ? `${guests.adults} Adult${guests.adults > 1 ? "s" : ""}` : ""}
            {guests?.children > 0 ? `, ${guests.children} Child${guests.children > 1 ? "ren" : ""}` : ""}
          </div>
          {isMobileModalOpen && (
            <MobileBookingModal
              checkIn={checkIn}
              checkOut={checkOut}
              guests={guests}
              roomData={roomData}
              setRoomData={setRoomData}
              onClose={() => setIsMobileModalOpen(false)}
              onCheckInChange={onCheckInChange}
              onCheckOutChange={onCheckOutChange}
              onGuestsChange={onGuestsChange}
              onSearch={(range) => {
                const start = new Date(range.startDate);
                const end = new Date(range.endDate);

                // Update states
                onCheckInChange(start);
                onCheckOutChange(end);
                updateDateRange(start, end);

                // Construct guestObj from roomData
                const totalAdults = roomData.reduce((sum, r) => sum + (r.adults || 0), 0);
                const totalChildren = roomData.reduce((sum, r) => sum + (r.children || 0), 0);
                const totalRooms = roomData.length;
                const guestObj = { adults: totalAdults, children: totalChildren, rooms: totalRooms };

                // Make sure guestObj is always passed in correct format
                console.log("👤 Final Guest Object Submitted:", guestObj);
                onGuestsChange({
                  adults: guestObj.adults || 1,
                  children: guestObj.children || 0,
                  rooms: guestObj.rooms || 1
                });

                // Save to local storage
                localStorage.setItem("selectedStartDate", start.toISOString());
                localStorage.setItem("selectedEndDate", end.toISOString());
                localStorage.setItem("selectedAdults", guestObj.adults || "1");
                localStorage.setItem("selectedChildren", guestObj.children || "0");
                localStorage.setItem("selectedRooms", guestObj.rooms || "1");

                setTimeout(() => window.dispatchEvent(new Event("localStorageUpdated")), 100);

                if (typeof window.triggerModifyFilterUpdate === "function") {
                  window.triggerModifyFilterUpdate();
                }

                if (typeof onSearch === "function") {
                  onSearch({ startDate: start, endDate: end });
                }

                setIsMobileModalOpen(false);
              }}
            />
          )}
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-start md:gap-3 gap-4">
            <div className="relative w-full sm:w-[360px]">
              <button
                className="flex items-center gap-2 px-6 py-2.5 w-full border border-gray-300 rounded-full shadow-sm text-sm text-gray-700 bg-white hover:shadow-md hover:border-primary transition-all duration-200"
                onClick={() => setShowCalendar(true)}
              >
                <CalendarDays size={16} />
                <span className="text-gray-500 text-sm font-medium">
                  {checkIn && checkOut
                    ? `${new Date(checkIn).toDateString()} – ${new Date(checkOut).toDateString()}`
                    : "Select dates"}
                </span>
              </button>
              {showCalendar && (
                <>
                  {console.log("📆 Popup mounted with:", { checkIn, checkOut })}
                  <CalendarPopup
                    key={`popup-${checkIn}-${checkOut}-${showCalendar}`}
                    selectionRange={{
                      startDate: checkIn ? new Date(checkIn) : undefined,
                      endDate: checkOut ? new Date(checkOut) : undefined
                    }}
                    onChange={({ startDate, endDate }) => {
                      console.log("📅 Selected range:", startDate, endDate);
                      onCheckInChange(startDate);
                      onCheckOutChange(endDate);
                      setShowCalendar(false);
                    }}
                    onClose={() => setShowCalendar(false)}
                    onSearch={onSearch}
                  />
                </>
              )}
            </div>

            <div className="relative w-[180px] hover:shadow-md hover:border-primary transition-all duration-200 rounded-full border border-gray-300 bg-white flex justify-center items-center text-sm font-normal text-gray-500">
              <GuestRoomSelector
                guests={{
                  adults: guests?.adults || 1,
                  children: guests?.children || 0,
                  childrenAges: guests?.childrenAges || [],
                  rooms: guests?.rooms || 1
                }}
                onSubmit={(value) => {
                  const parsed =
                    typeof value === 'string'
                      ? { adults: parseInt(value) || 1, children: 0, rooms: 1 }
                      : value;
                  onGuestsChange(parsed);
                }}
              />
            </div>
          </div>

        </div>
      )}
    </div>
  );
};

export default ModifyReservationFilters;