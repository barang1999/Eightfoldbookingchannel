import React, { useEffect, useState, useContext } from "react";
import { Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import RoomCard from "../components/RoomCard";
import PriceSummary from "../components/PriceSummary";
import { fetchRooms } from "../services/api";
import { fetchRates } from "../services/rateService";
import Header from "../components/Header";
import HotelProfile from "../components/HotelProfile";
import RoomSearchFilters from "../components/RoomSearchFilters";
import MobileBookingCart from "../components/MobileBookingCart";
import MobilePriceSummary from "../components/MobilePriceSummary";
import { normalizeSelectedRooms } from "../utils/normalizeSelectedRooms";
import { SelectedRoomsProvider } from "../contexts/SelectedRoomsContext";
import { refreshSelectedRooms, refreshAllRoomRates } from "../utils/rateRefresher";
import { useSelectedRooms } from "../contexts/SelectedRoomsContext";
import SupportButton from "../components/SupportButton";

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

const HomeContent = () => {
  // Hardcoded property for testing
  const property = { _id: "6803cba3dadf9a0d829427fe" };
  // Store propertyId in localStorage for SupportButton, etc.
  localStorage.setItem("propertyId", "6803cba3dadf9a0d829427fe");
  console.log("🏨 Property ID set in localStorage:", property._id);
  // Store selectedHotel in localStorage for MobilePriceSummary
  useEffect(() => {
    localStorage.setItem("selectedHotel", JSON.stringify({
      name: "EIGHTFOLD URBAN RESORT",
      stars: 5,
      thumbnail: "/your-image.jpg", // update as needed
      propertyId: property._id
    }));
  }, []);

  // Scroll to room-search-section if checkIn param is present
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.has("checkIn")) {
      const section = document.getElementById("room-search-section");
      if (section) section.scrollIntoView({ behavior: "smooth" });
    }
  }, []);

  // Fetch VAT policy and store percentage in localStorage
  useEffect(() => {
    async function fetchVAT() {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/policies?propertyId=${property._id}`);
        const data = await res.json();
        const vatPolicy = data?.[0]?.vat;
        if (vatPolicy?.enabled) {
          localStorage.setItem('vatPercentage', vatPolicy.percentage);
        }
      } catch (err) {
        console.error("❌ Failed to fetch VAT policy:", err);
      }
    }
    fetchVAT();
  }, []);

  // Extract query params and set booking state accordingly
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const checkInStr = params.get("checkIn");
    const checkOutStr = params.get("checkOut");
    const parseLocalDate = (str) => {
      const [year, month, day] = str.split("-").map(Number);
      return new Date(year, month - 1, day);
    };
    const checkIn = checkInStr ? parseLocalDate(checkInStr) : null;
    const checkOut = checkOutStr ? parseLocalDate(checkOutStr) : null;
    const adults = parseInt(params.get("adults"), 10);
    const children = parseInt(params.get("children"), 10);

    // Debugging: log extracted values from URL
    console.log("🔍 Extracted from URL:");
    console.log("checkIn:", checkInStr);
    console.log("checkOut:", checkOutStr);
    console.log("adults:", adults);
    console.log("children:", children);

    if (checkIn && checkOut) {
      setDateRange({
        startDate: checkIn,
        endDate: checkOut
      });
      localStorage.setItem("selectedStartDate", checkInStr);
      localStorage.setItem("selectedEndDate", checkOutStr);
      // Debugging: log setDateRange
      console.log("✅ setDateRange to:", { startDate: checkIn, endDate: checkOut });
    }

    if (!isNaN(adults) || !isNaN(children)) {
      const parsedAdults = isNaN(adults) ? 1 : adults;
      const parsedChildren = isNaN(children) ? 0 : children;
      const guests = [{ adults: parsedAdults, children: parsedChildren }];
      setGuestRooms(guests);
      localStorage.setItem("selectedAdults", parsedAdults.toString());
      localStorage.setItem("selectedChildren", parsedChildren.toString());
      // Debugging: log setGuestRooms
      console.log("✅ setGuestRooms to:", guests);
    }

    if (checkIn || checkOut || !isNaN(adults) || !isNaN(children)) {
      setShouldRefresh(true);
    }
  }, []);
  const [rooms, setRooms] = useState([]);
  const [dateRange, setDateRange] = useState({
    startDate: "2025-05-29",
    endDate: "2025-05-30"
  });
  const [breakfastIncluded, setBreakfastIncluded] = useState(false);
  const [guestRooms, setGuestRooms] = useState([{ adults: 2, children: 0, childrenAges: [] }]);
  const [showMobilePriceSummary, setShowMobilePriceSummary] = useState(false);
  const [loading, setLoading] = useState(false);
  const [shouldRefresh, setShouldRefresh] = useState(false);

  const { selectedRooms, updateRoomsAfterRateRefresh } = useSelectedRooms();

  useEffect(() => {
    const stored = localStorage.getItem('lastSearchPayload');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed.startDate && parsed.endDate) {
          setDateRange({
            startDate: parsed.startDate,
            endDate: parsed.endDate
          });
          setBreakfastIncluded(!!parsed.breakfastIncluded);
          setShouldRefresh(true);
          setTimeout(() => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }, 100);
        }
      } catch (err) {
        console.error("⚠️ Failed to parse lastSearchPayload:", err);
      }
    }
  }, []);

  useEffect(() => {
    const hasQueryParams = new URLSearchParams(window.location.search).has("checkIn");
    if (hasQueryParams) return;

    const stored = localStorage.getItem('lastSearchPayload');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed.startDate && parsed.endDate) {
          setDateRange({
            startDate: parsed.startDate,
            endDate: parsed.endDate
          });
          setBreakfastIncluded(!!parsed.breakfastIncluded);
          setShouldRefresh(true);
          setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 100);
        }
      } catch (err) {
        console.error("⚠️ Failed to parse lastSearchPayload:", err);
      }
    }
  }, []);

  useEffect(() => {
    const handleRoomRefresh = () => {
      console.log("📱 Mobile triggerRoomRefresh event received.");
      setShouldRefresh(true);
    };
    window.addEventListener("triggerRoomRefresh", handleRoomRefresh);
    return () => {
      window.removeEventListener("triggerRoomRefresh", handleRoomRefresh);
    };
  }, []);

  

  /*
  // --- useEffect to fetch fresh rooms and refresh all rates when dependencies change ---
  useEffect(() => {
    if (property && dateRange.startDate && dateRange.endDate) {
      const fetchAndRefresh = async () => {
        setLoading(true);
        try {
          const availableRooms = await fetchRooms(property._id, dateRange.startDate, dateRange.endDate);
          console.log("🏨 Fresh fetched rooms:", availableRooms);
          console.log("📊 AvailableRooms (raw):", availableRooms);

          if (!availableRooms || availableRooms.length === 0) {
            setRooms([]);
            return;
          }

          const limitedRooms = availableRooms.slice(0, 3);
          console.time("⏱️ Rate refresh");
          const refreshed = await refreshAllRoomRates(limitedRooms, dateRange, breakfastIncluded);
          console.timeEnd("⏱️ Rate refresh");
          console.log("🔄 Refreshed rooms after rate update:", refreshed);
          console.log("📊 RefreshedRooms (after rates):", refreshed);

          // Utility function for stable room comparison (prevents infinite update loop)
          const isSame = (a, b) =>
            a.length === b.length &&
            a.every((room, idx) =>
              room._id === b[idx]._id &&
              room.price === b[idx].price &&
              room.perNight === b[idx].perNight &&
              room.vat === b[idx].vat &&
              room.unavailable === b[idx].unavailable
            );
          // Prevent infinite setRooms loop if data hasn't changed
          if (isSame(rooms, refreshed)) {
            console.log("🛑 No change in room data, skipping update.");
            return;
          }
          if (refreshed.length > 0) {
            setRooms(refreshed);
          } else {
            setRooms([]);
          }
          setLoading(false);
        } catch (err) {
          console.error("❌ fetchAndRefresh error:", err);
          setRooms([]);
        } finally {
          console.log("🛑 Done loading from fetchAndRefresh");
        }
      };

      fetchAndRefresh();
    }
  }, [property, dateRange.startDate, dateRange.endDate, breakfastIncluded]);
  */

  const triggerRoomRefresh = async () => {
    setLoading(true);
    try {
      const availableRooms = await fetchRooms(property._id, new Date(dateRange.startDate), new Date(dateRange.endDate));

      if (!availableRooms || availableRooms.length === 0) {
        setRooms([]);
        return;
      }

      const latestBreakfastIncluded = localStorage.getItem("includeBreakfast") === "true";

      const formattedRange = {
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
      };

      const refreshed = await refreshAllRoomRates(availableRooms, formattedRange, latestBreakfastIncluded);
      // 🍳 Debug log after rates refresh
    


      const isSame = (a, b) =>
        a.length === b.length &&
        a.every((room, idx) =>
          room._id === b[idx]._id &&
          room.price === b[idx].price &&
          room.perNight === b[idx].perNight &&
          room.vat === b[idx].vat &&
          room.unavailable === b[idx].unavailable &&
          room.rateDataHash === b[idx].rateDataHash &&
          room.basePriceWithBreakfast === b[idx].basePriceWithBreakfast &&
          room.promotionPriceWithBreakfast === b[idx].promotionPriceWithBreakfast
        );

      if (isSame(rooms, refreshed)) {
        return;
      }

      setRooms(refreshed.length > 0 ? refreshed : []);
    } catch (err) {
      console.error("❌ fetchAndRefresh error:", err);
      setRooms([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (shouldRefresh) {
      triggerRoomRefresh().finally(() => setShouldRefresh(false));
    }
  }, [shouldRefresh]);

  const handleSearchDate = async () => {
    setLoading(true);
    try {
      // Removed direct fetch and refresh logic
    } finally {
      setLoading(false);
      setShouldRefresh(true);
    }
  };

  const handleGuestSelection = (rooms) => {
    console.log("Selected guest rooms:", rooms);
    setGuestRooms(rooms);
  };

  // Add handleCalendarSearch for date + search synchronization
  const handleCalendarSearch = async (newDateRange) => {
    const nights = Math.max(
      1,
      Math.ceil((new Date(dateRange.endDate) - new Date(dateRange.startDate)) / (1000 * 60 * 60 * 24))
    );
    setDateRange(newDateRange);
    setLoading(true);
    try {
      // Refresh selected room prices and update context before triggering room refresh
      if (property?._id) {
        const formattedRange = {
          startDate: newDateRange.startDate,
          endDate: newDateRange.endDate,
        };
        const refreshed = await refreshSelectedRooms(
          selectedRooms,
          formattedRange
        );
        updateRoomsAfterRateRefresh(refreshed);
      }
    } finally {
      setLoading(false);
      setShouldRefresh(true);
    }
  };


  // totalPrice and nights calculation depend on selectedRooms from context, will patch later

  const nights = Math.max(
    1,
    Math.ceil((new Date(dateRange.endDate) - new Date(dateRange.startDate)) / (1000 * 60 * 60 * 24))
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -30 }}
      transition={{ duration: 0.5 }}
    >
      {/* Loading spinner overlay removed; rely on skeletons for loading feedback */}
      <Header />
      <main className="bg-[#f9f9f9] min-h-screen py-6 pb-32">
        <SupportButton
          propertyId={property._id}
          className="fixed bottom-32 right-0 md:bottom-12 md:right-6 z-40"
        />
        <div className="max-w-7xl mx-auto px-3 sm:px-4">
          <div className="flex flex-col lg:flex-row gap-5">
            <div className="flex-1 space-y-3">
            <HotelProfile propertyId={property._id} />
              <div id="room-search-section">
                <RoomSearchFilters
                  dateRange={dateRange}
                  setDateRange={setDateRange}
                  breakfastIncluded={breakfastIncluded}
                  setBreakfastIncluded={setBreakfastIncluded}
                  handleSearchDate={handleCalendarSearch}
                  handleGuestSelection={handleGuestSelection}
                  numberOfRooms={rooms.length}
                  propertyId={property?._id}
                  guestButtonClassName="min-w-[180px]"
                />
              </div>
              {loading ? (
                <div className="space-y-6">
                  {[1, 2, 3].map((i) => (
                    <SkeletonBlock key={i} className="h-[160px] w-full" />
                  ))}
                </div>
              ) : rooms && rooms.length > 0 ? (
                [...rooms].sort((a, b) => {
                  const aSoldOut = a.unavailable ? 1 : 0;
                  const bSoldOut = b.unavailable ? 1 : 0;
                  return aSoldOut - bSoldOut;
                }).map((room, idx) => (
                  <div key={idx} className="mb-6">
                    <RoomCard
                      room={room}
                      propertyId={property._id}
                      startDate={new Date(dateRange.startDate)}
                      endDate={new Date(dateRange.endDate)}
                      breakfastIncluded={breakfastIncluded}
                      onAddRoom={() => {}}
                      nights={nights}
                      loadingRate={loading}
                    />
                  </div>
                ))
              ) : (
                <div className="text-center text-gray-500">No rooms available.</div>
              )}
            </div>

            

            <aside className="w-full lg:w-[480px] flex-shrink-0 sticky top-6 self-start hidden sm:block">
              <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100">
                <PriceSummary
                  selectedRooms={selectedRooms}
                  onRemoveRoom={() => {}}
                  propertyId={property._id}
                  loadingRate={loading}
                />
              </div>
            </aside>
          </div>
        </div>
      </main>
      <MobileBookingCart
        selectedRooms={selectedRooms}
        property={property}
        totalPrice={0}
        nights={0}
        onContinue={() => { console.log("Continue clicked"); }}
        onExpand={() => setShowMobilePriceSummary(true)}
      />
      {showMobilePriceSummary && (
        <MobilePriceSummary
        selectedRooms={selectedRooms}
        totalPrice={0}
        nights={0}
        property={property} // pass full object instead
        propertyId={property._id} // or pass this explicitly
        onConfirm={() => setShowMobilePriceSummary(false)}
        onRemoveRoom={() => {}}
      />
      )}
    </motion.div>
  );
};

export default function Home() {
  return (
    <SelectedRoomsProvider>
      <HomeContent />
    </SelectedRoomsProvider>
  );
}