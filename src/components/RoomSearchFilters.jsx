import React, { useEffect, useState } from "react";
import { CalendarDays, User, Check } from "lucide-react"; // optional icons
import CalendarPopup from "../components/CalendarPopup";
import GuestRoomSelector from "../components/GuestRoomSelector";
import MobileBookingModal from "./MobileBookingModal";
import { useSelectedDate } from "../contexts/SelectedDateContext";
import { useTranslation } from "react-i18next";


const RoomSearchFilters = ({ numberOfRooms, propertyId, handleSearchDate }) => {
  const { dateRange, updateDateRange } = useSelectedDate();
  const { t, i18n } = useTranslation("translation");

  const [showCalendar, setShowCalendar] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [roomData, setRoomData] = useState(() => {
    const storedAdults = parseInt(localStorage.getItem('selectedAdults'), 10);
    const storedChildren = parseInt(localStorage.getItem('selectedChildren'), 10);
    if (!isNaN(storedAdults) || !isNaN(storedChildren)) {
      return [{ adults: storedAdults || 1, children: storedChildren || 0 }];
    }
    return [{ adults: 1, children: 0 }];
  });
  const [isMobileModalOpen, setIsMobileModalOpen] = useState(false);

  const handleEditClick = () => {
    setIsMobileModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsMobileModalOpen(false);
  };

  const handleDateChange = (range) => {
    if (!range || !range.startDate || !range.endDate) {
      console.warn("⚠️ handleDateChange called with invalid range:", range);
      return;
    }

    updateDateRange(range.startDate, range.endDate);

    localStorage.setItem('selectedStartDate', range.startDate);
    localStorage.setItem('selectedEndDate', range.endDate);

    const localStorageUpdatedEvent = new Event('localStorageUpdated');
    window.dispatchEvent(localStorageUpdatedEvent);
  };

  const handleGuestSelection = (updatedRoomData) => {
    setRoomData(updatedRoomData);
    const totalAdults = updatedRoomData.reduce((sum, room) => sum + room.adults, 0);
    const totalChildren = updatedRoomData.reduce((sum, room) => sum + room.children, 0);

    localStorage.setItem('selectedAdults', totalAdults);
    localStorage.setItem('selectedChildren', totalChildren);

    // ✅ Added for BookingSummaryBox compatibility
    localStorage.setItem('numAdults', totalAdults.toString());
    localStorage.setItem('numChildren', totalChildren.toString());

    const localStorageUpdatedEvent = new Event('localStorageUpdated');
    window.dispatchEvent(localStorageUpdatedEvent);
  };

  // Parse query params on mount for checkIn, checkOut, adults, children
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const checkInStr = params.get("checkIn");
    const checkOutStr = params.get("checkOut");
    const adults = parseInt(params.get("adults"), 10);
    const children = parseInt(params.get("children"), 10);

    const parseLocalDate = (str) => {
      const [year, month, day] = str.split("-").map(Number);
      return new Date(year, month - 1, day);
    };

    const checkIn = checkInStr ? parseLocalDate(checkInStr) : null;
    const checkOut = checkOutStr ? parseLocalDate(checkOutStr) : null;

    if (checkIn && checkOut) {
      updateDateRange(checkIn, checkOut);
      localStorage.setItem("selectedStartDate", checkInStr);
      localStorage.setItem("selectedEndDate", checkOutStr);
    }

    if (!isNaN(adults) || !isNaN(children)) {
      const parsedAdults = isNaN(adults) ? 1 : adults;
      const parsedChildren = isNaN(children) ? 0 : children;
      setRoomData([{ adults: parsedAdults, children: parsedChildren }]);
      localStorage.setItem("selectedAdults", parsedAdults.toString());
      localStorage.setItem("selectedChildren", parsedChildren.toString());
      localStorage.setItem("numAdults", parsedAdults.toString());
      localStorage.setItem("numChildren", parsedChildren.toString());
    }
  }, []);

  useEffect(() => {
    const existingStartDate = localStorage.getItem('selectedStartDate');
    const existingEndDate = localStorage.getItem('selectedEndDate');
    const existingAdults = localStorage.getItem('selectedAdults');
    const existingChildren = localStorage.getItem('selectedChildren');
  
    const totalAdults = roomData.reduce((total, room) => total + room.adults, 0);
    const totalChildren = roomData.reduce((total, room) => total + room.children, 0);
  
    if (!existingStartDate && dateRange?.startDate) {
      localStorage.setItem('selectedStartDate', dateRange.startDate);
    }
    if (!existingEndDate && dateRange?.endDate) {
      localStorage.setItem('selectedEndDate', dateRange.endDate);
    }
    if (!existingAdults) {
      localStorage.setItem('selectedAdults', totalAdults.toString());
    }
    if (!existingChildren) {
      localStorage.setItem('selectedChildren', totalChildren.toString());
    }
  }, [dateRange, roomData]);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const hasQueryParams = new URLSearchParams(window.location.search).has("checkIn");
    if (hasQueryParams) return;

    const stored = localStorage.getItem("lastSearchPayload");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed.startDate && parsed.endDate) {
          updateDateRange(parsed.startDate, parsed.endDate);
          if (parsed.adults || parsed.children) {
            setRoomData([{ adults: parsed.adults || 1, children: parsed.children || 0 }]);
          }

          setTimeout(() => {
            handleSearchDate({
              startDate: parsed.startDate,
              endDate: parsed.endDate,
            });
          }, 300);
        }
      } catch (err) {
        console.error("❌ Failed to parse lastSearchPayload", err);
      }
    }
  }, []);

  useEffect(() => {
    console.log("🔄 Syncing UI with updated roomData and dateRange");
    console.log("➡️ Current dateRange:", dateRange);
    console.log("➡️ Current roomData:", roomData);
  }, [dateRange, roomData]);

  const logSearchDetails = () => {
    console.log("📅 Start Date:", dateRange.startDate);
    console.log("📅 End Date:", dateRange.endDate);
    // Here later you can trigger fetching new rates
  };

  return (
    <section className="bg-white py-6">
      <div className="max-w-7xl mx-auto px-4">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">{t("searchFlow.selectRoom", { defaultValue: "Choose Your Room" })}</h3>
        {isMobile ? (
          <div className="border rounded-xl p-4 bg-white shadow-sm text-sm text-gray-800">
            <div className="flex justify-between items-center mb-1">
              <span className="text-gray-500 flex items-center gap-2">
                <CalendarDays size={16} /> {t("searchFlow.search", "Search your stay")}
              </span>
              <button onClick={handleEditClick} className="text-blue-600 text-sm font-medium underline">
                {t("navigation.back", "edit")}
              </button>
            </div>
            <div className="text-base font-semibold">
              From {new Date(dateRange?.startDate).toLocaleDateString("en-GB", { day: "2-digit", month: "short" })} to{" "}
              {new Date(dateRange?.endDate).toLocaleDateString("en-GB", { day: "2-digit", month: "short" })}{" "}
              <span className="font-normal text-gray-600">
                ({Math.round((new Date(dateRange.endDate) - new Date(dateRange.startDate)) / (1000 * 60 * 60 * 24))} nights)
              </span>
            </div>
            <div className="text-base mt-1">
              {roomData.length} Room{roomData.length > 1 ? "s" : ""},{" "}
              {roomData.reduce((t, r) => t + r.adults, 0)} Adult{roomData.reduce((t, r) => t + r.adults, 0) > 1 ? "s" : ""},{" "}
              {roomData.reduce((t, r) => t + r.children, 0)} Child{roomData.reduce((t, r) => t + r.children, 0) !== 1 ? "ren" : ""}
            </div>
          </div>
        ) : (
          <div className="flex flex-wrap gap-4 items-center mb-4">
            <div className="relative">
              <button
                onClick={() => setShowCalendar(!showCalendar)}
                className="flex items-center gap-2 px-6 py-2.5 w-[360px] border border-gray-300 rounded-full shadow-sm text-sm text-gray-700 bg-white hover:shadow-md hover:border-primary transition-all duration-200"
              >
                <CalendarDays size={16} />
                <span className="text-gray-500 text-sm font-medium">
                  {dateRange?.startDate ? new Date(dateRange.startDate).toDateString() : 'Select dates'} - {dateRange?.endDate ? new Date(dateRange.endDate).toDateString() : ''}
                </span>
              </button>
              {showCalendar && (
                <CalendarPopup
                  onClose={() => setShowCalendar(false)}
                  selectionRange={dateRange}
                  onChange={handleDateChange}
                  onSearch={async (newRange) => {
                    if (typeof handleSearchDate === "function") {
                      await handleSearchDate(newRange);
                      logSearchDetails();

                      // Store search info in localStorage with clean YYYY-MM-DD strings
                      const searchPayload = {
                        startDate: newRange.startDate,
                        endDate: newRange.endDate,
                        adults: roomData.reduce((sum, r) => sum + r.adults, 0),
                        children: roomData.reduce((sum, r) => sum + r.children, 0),
                      };
                      localStorage.setItem('lastSearchPayload', JSON.stringify(searchPayload));
                    }
                    setShowCalendar(false);
                  }}
                  propertyId={propertyId}
                />
              )}
            </div>
            <div className="relative w-[180px] hover:shadow-md hover:border-primary transition-all duration-200 rounded-full border border-gray-300 bg-white flex justify-center items-center text-sm font-normal text-gray-500">
              <GuestRoomSelector
                onSubmit={handleGuestSelection}
                defaultValues={roomData}
              />
            </div>
          </div>
        )}
        {isMobileModalOpen && (
          <MobileBookingModal
            dateRange={dateRange}
            setDateRange={updateDateRange}
            roomData={roomData}
            setRoomData={setRoomData}
            onClose={handleCloseModal}
            handleSearchDate={handleSearchDate} // ✅ pass it
          />
        )}
        <div className="text-sm text-gray-700 font-semibold mb-2 mt-6 tracking-wide uppercase">
          {`${numberOfRooms} ${t("actions.rooms", "Rooms")}`}
        </div>
        <div className="flex flex-wrap gap-4 items-center text-sm text-gray-700 mt-4">
          <label className="flex items-center gap-2 px-3 py-2 border rounded-full hover:border-primary active:border-primary/80 transition-all duration-200 cursor-pointer hover:shadow-md">
            <input type="checkbox" className="accent-primary rounded-sm transition duration-150" />
            {t("actions.freeCancellation", "Free cancellation")}
          </label>
        </div>
      </div>
    </section>
  );
};

export default RoomSearchFilters;