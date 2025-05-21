// ModifyReservationPage.jsx

import React, { useEffect, useState, useRef, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Header from "../components/Header";
import PageNavigation from "../components/PageNavigation";
import RoomBedSelection from "../components/RoomBedSelection";
import MobileReservationSummary from "../components/MobileReservationSummary";
import HotelProfile from "../components/HotelProfile";
import ModifyReservationFilters from "../components/ModifyReservationFilters";
import ModifyRoomCard from "../components/ModifyRoomCard";
import { formatCurrency } from "../utils/formatCurrency";
import { useCurrency } from "../contexts/CurrencyProvider";
import { refreshAllRoomRates } from "../utils/rateRefresher";
import SupportButton from "../components/SupportButton";
import { Loader2, AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";
import { useSelectedRooms } from "../contexts/SelectedRoomsContext";


// Helper to summarize guests object or array
const getGuestSummaryFromObject = (guests) => {
  if (!guests) return { totalAdults: 0, totalChildren: 0 };
  if (typeof guests === 'string') {
    try {
      guests = JSON.parse(guests);
    } catch (e) {
      const match = guests.match(/(\d+)/);
      const adults = match ? parseInt(match[1], 10) : 1;
      return { totalAdults: adults, totalChildren: 0 };
    }
  }
  let totalAdults = 0;
  let totalChildren = 0;
  if (Array.isArray(guests)) {
    guests.forEach(g => {
      totalAdults += g?.adults || 0;
      totalChildren += g?.children || 0;
    });
  } else if (typeof guests === 'object') {
    totalAdults = guests.adults || 0;
    totalChildren = guests.children || 0;
  }
  return { totalAdults, totalChildren };
};


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

const ModifyReservationPage = () => {
  // Save guest info to localStorage
  const saveGuestInfoToLocalStorage = () => {
    const name = document.querySelector('input[placeholder="Full Name"]')?.value || "";
    const email = document.querySelector('input[placeholder="Email Address"]')?.value || "";
    const phone = document.querySelector('input[placeholder="Phone Number"]')?.value || "";
    const arrivalTime = document.querySelector('select')?.value || "";
    const specialRequest = document.querySelector('textarea')?.value || "";

    const guestInfo = {
      name,
      email,
      phone,
      arrivalTime,
      specialRequest
    };
    localStorage.setItem("modifyGuestInfo", JSON.stringify(guestInfo));
  };
  const [showUnavailableMessage, setShowUnavailableMessage] = useState(false);
  const { id } = useParams();
  const navigate = useNavigate();
  const [reservation, setReservation] = useState(null);
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState("");
  // Persist latest guests value in a ref
  const guestsRef = useRef(guests);
  useEffect(() => {
    guestsRef.current = guests;
  }, [guests]);
  const { exchangeRate, currencyCode } = useCurrency();
  const [availableRooms, setAvailableRooms] = useState([]);
  const [loadingRate, setLoadingRate] = useState(false);
  const [policy, setPolicy] = useState(null);
  // Remove local selectedRooms state; use context instead
  // Room list toggle state
  const [showRoomList, setShowRoomList] = useState(true);
  const [pageLoading, setPageLoading] = useState(true);
  // Mobile summary modal state
  const [showMobileSummary, setShowMobileSummary] = useState(false);
  // Helper to generate a unique instanceId for each selected room
  const generateInstanceId = (room) => {
    // Uses timestamp plus random for uniqueness
    return `${room._id}_${Date.now()}_${Math.floor(Math.random() * 100000)}`;
  };
  // Add a room object (with unique instanceId and enhanced rate fallback logic)
  const handleRoomSelect = async (roomObj) => {
    const instanceId = roomObj.instanceId || generateInstanceId(roomObj);

    let fullRoomData = {};
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/api/rooms/${roomObj.roomId}?propertyId=${reservation?.propertyId}`
      );
      fullRoomData = res.data;
    } catch (err) {
      console.warn("⚠️ Could not fetch full room data for capacity check", err);
    }

    // Enhanced rate fallback logic
    const baseRate =
      roomObj.baseRate ??
      roomObj.promotionRoomOnlyRate ??
      roomObj.roomOnlyRate ??
      roomObj.price ??
      fullRoomData.basePriceRoomOnly ??
      fullRoomData.promotionRoomOnlyRate ??
      fullRoomData.roomOnlyRate ??
      fullRoomData.price ??
      0;

    const vatRate = fullRoomData.vat ?? roomObj.vat ?? 10;
    const taxesAndFees = baseRate * vatRate / 100;
    const totalAfterTax = baseRate + taxesAndFees;

    const enrichedRoom = {
      ...roomObj,
      ...fullRoomData,
      instanceId,
      roomId: roomObj.roomId || roomObj.id,
      baseRate,
      vat: vatRate,
      taxesAndFees,
      totalAfterTax,
      breakfastIncluded:
        roomObj?.breakfastIncluded === true ||
        roomObj?.breakfastIncluded === "true" ||
        false,
      capacity: fullRoomData.capacity ?? roomObj.capacity,
    };

    setSelectedRooms((prev) => [...prev, enrichedRoom]);
  };
  const [breakfastIncluded, setBreakfastIncluded] = useState(true);
  // Ref to track latest breakfastIncluded filter value for use in effects
  const useBreakfastIncludedRef = useRef(breakfastIncluded);
  useEffect(() => {
    useBreakfastIncludedRef.current = breakfastIncluded;
  }, [breakfastIncluded]);
  const checkInRef = useRef(checkIn);
  const checkOutRef = useRef(checkOut);
  const handleSearchAvailability = async () => {
    // Update guestsRef with current guests state to ensure accuracy
    guestsRef.current = guests;
    // Parse guests if needed and update state/ref safely
    try {
      if (typeof guests === 'string') {
        const parsed = JSON.parse(guests);
        if (parsed && typeof parsed === 'object') {
          setGuests(parsed);
          guestsRef.current = parsed;
        }
      } else {
        guestsRef.current = guests;
      }
    } catch (e) {
      guestsRef.current = guests;
    }

    setLoadingRate(true);
    try {
    const propertyId =
      reservation?.propertyId ||
      (reservation?.rooms?.[0]?.propertyId ?? availableRooms[0]?.propertyId ?? null);
    if (!propertyId || !checkInRef.current || !checkOutRef.current) {
      console.warn("🚫 Missing required data for availability fetch:", { propertyId, checkIn: checkInRef.current, checkOut: checkOutRef.current });
      return;
    }

    const roomsRes = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/rooms`, {
      params: { propertyId }
    });

    const fetchedRooms = await refreshAllRoomRates(
      roomsRes.data,
      {
        startDate: new Date(checkInRef.current).toISOString().split("T")[0],
        endDate: new Date(checkOutRef.current).toISOString().split("T")[0],
      },
      useBreakfastIncludedRef.current
    );

    setAvailableRooms(fetchedRooms);
  } catch (error) {
    console.error("Failed to fetch available rooms:", error);
  } finally {
    setLoadingRate(false);
  }
};

useEffect(() => {
  // Only execute fetch if id exists and is not undefined/null/empty
  if (!id) return;
  // Remove any previous lastSearchPayload so ModifyReservationFilters uses correct checkIn/checkOut props
  localStorage.removeItem("lastSearchPayload");
  const fetchReservation = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_BOOKING_API_URL}/${id}`);
      const data = res.data;
      const checkInDate = new Date(data.checkIn);
      const checkOutDate = new Date(data.checkOut);
      const nights = Math.max((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24), 0);
      setReservation({ ...data, nights });
      // --- Prefill selectedRooms with enriched info from reservation.rooms ---
      // --- Fetch property policy for VAT percentage ---
      let vatRate = 0.1; // default to 10%
      try {
        // Try to get the policy for the property
        const policyRes = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/policies?propertyId=${data.propertyId}`);
        setPolicy(Array.isArray(policyRes.data) ? policyRes.data[0] : policyRes.data);
        const policyData = Array.isArray(policyRes.data) ? policyRes.data[0] : policyRes.data;
        // Use vat.percentage if vat.enabled is true
        if (policyData?.vat?.enabled && typeof policyData.vat.percentage === 'number') {
          vatRate = policyData.vat.percentage / 100;
        }
      } catch (e) {
        // fallback: use default 10%
      }
      const enriched = (data.rooms || []).map((room) => {
        const base = room.baseRate ?? room.price ?? 0;
        // VAT-inclusive logic: extract VAT from total
        const tax = base * vatRate / (1 + vatRate);
        const total = base; // VAT already included in base
        const instanceId = room.instanceId || `${room.roomId || room._id}_${Date.now()}_${Math.floor(Math.random() * 100000)}`;
        room.instanceId = instanceId; // Ensure original reservation.rooms has instanceId

        return {
          ...room,
          instanceId,
          roomId: room.roomId || room._id,
          baseRate: base,
          taxesAndFees: tax,
          totalAfterTax: total,
          // --- Pass forward all relevant pricing fields for ModifyConfirmationPage fallback logic
          basePriceRoomOnly: room.basePriceRoomOnly ?? room.price ?? 0,
          promotionRoomOnlyRate: room.promotionRoomOnlyRate ?? undefined,
          roomOnlyRate: room.roomOnlyRate ?? undefined,
          price: room.price ?? 0,
          breakfastIncluded: room.breakfastIncluded === true,
          requiresBedChoice:
            typeof room.requiresBedChoice === 'boolean'
              ? room.requiresBedChoice
              : (Array.isArray(room.bedTypes) && room.bedTypes.length > 1),
          bedTypes:
            Array.isArray(room.bedTypes) && room.bedTypes.length > 0
              ? room.bedTypes
              : Array.isArray(room.fixedBedSetup) && room.fixedBedSetup.length > 0
              ? room.fixedBedSetup
              : room.bedType
              ? [room.bedType]
              : ['1 large double bed'],
          fixedBedSetup: Array.isArray(room.fixedBedSetup) && room.fixedBedSetup.length > 0
            ? room.fixedBedSetup
            : (room.bedType ? [room.bedType] : []),
          doubleBedCount: room.doubleBedCount ?? 1,
          singleBedCount: room.singleBedCount ?? 2,
          name: room.roomType || room.name || "Room",
          propertyId: data.propertyId,
        };
      });
      // --- Fetch full room details for each room and overwrite bed-related props ---
      const roomDetailsMap = {};

      await Promise.all(enriched.map(async (room) => {
        try {
          const response = await axios.get(
            `${import.meta.env.VITE_API_BASE_URL}/api/rooms/${room.roomId}?propertyId=${data.propertyId}`
          );
          roomDetailsMap[room.roomId] = response.data;
        } catch (err) {
          console.warn(`❌ Failed to fetch full room details for ${room.roomId}`, err);
        }
      }));

      const fullyEnriched = enriched.map((room) => {
        const fullData = roomDetailsMap[room.roomId] || {};
        return {
          ...room,
          requiresBedChoice: fullData.requiresBedChoice ?? room.requiresBedChoice,
          bedTypes: fullData.bedTypes ?? room.bedTypes,
          fixedBedSetup: fullData.fixedBedSetup ?? room.fixedBedSetup,
          doubleBedCount: fullData.doubleBedCount ?? room.doubleBedCount,
          singleBedCount: fullData.singleBedCount ?? room.singleBedCount,
        };
      });

      setSelectedRooms(fullyEnriched);
      setCheckIn(data.checkIn.slice(0, 10));
      setCheckOut(data.checkOut.slice(0, 10));
      checkInRef.current = data.checkIn.slice(0, 10);
      checkOutRef.current = data.checkOut.slice(0, 10);
      setGuests(data.guests);
      guestsRef.current = data.guests;
      if (typeof data.guests === 'string') {
        try {
          const parsedGuests = JSON.parse(data.guests);
          if (parsedGuests && typeof parsedGuests === 'object') {
            setGuests(parsedGuests);
            guestsRef.current = parsedGuests;
          }
        } catch (e) {
          // fallback: match numeric string
          const match = data.guests.match(/(\d+)/);
          const adults = match ? parseInt(match[1], 10) : 1;
          const fallbackGuests = { adults, children: 0 };
          setGuests(fallbackGuests);
          guestsRef.current = fallbackGuests;
        }
      }
      // After setting checkIn, checkOut, and refs, reset lastSearchPayload to current booked reservation to prevent stale values
      localStorage.setItem("lastSearchPayload", JSON.stringify({
        startDate: data.checkIn.slice(0, 10),
        endDate: data.checkOut.slice(0, 10),
        breakfastIncluded: data.rooms?.[0]?.breakfastIncluded ?? true
      }));
    } catch (err) {
      console.error("Failed to fetch reservation:", err);
      navigate("/not-found");
    } finally {
      setPageLoading(false);
    }
  };

  fetchReservation();
}, [id, navigate]);


  const formatDate = (isoDate) =>
    new Date(isoDate).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

  // Use context for selectedRooms
  const { selectedRooms, setSelectedRooms } = useSelectedRooms();
  const availableSelectedRooms = selectedRooms.filter((room) => {
    const match = availableRooms.find(
      (ar) => ar.roomId === room.roomId || ar._id === room.roomId || ar._id === room._id
    );
    return !(match?.unavailable === true);
  });

  const subtotal = availableSelectedRooms.reduce((sum, room) => sum + (room.baseRate || 0), 0);
  const taxTotal = availableSelectedRooms.reduce((sum, room) => sum + (room.taxesAndFees || 0), 0);
  const total = availableSelectedRooms.reduce((sum, room) => sum + (room.totalAfterTax || 0), 0);
  const roomsWithBedChoice = selectedRooms.filter(room => {
    const requiresChoiceFlag = room.requiresBedChoice === true;
    const hasMultipleBedTypes = Array.isArray(room.bedTypes) && room.bedTypes.length > 1;
    const hasNoFixedBedSetup = !Array.isArray(room.fixedBedSetup) || room.fixedBedSetup.length === 0;

    const shouldInclude = requiresChoiceFlag || (hasMultipleBedTypes && hasNoFixedBedSetup);
    return shouldInclude;
  });

  // --- Memoized guest/capacity logic for price summary ---
  const { totalGuests, exceedsCapacity } = useMemo(() => {
    // Normalize guests object before passing to getGuestSummaryFromObject
    const normalizedGuests = (() => {
      if (typeof guests === 'string') {
        const match = guests.match(/(\d+)/);
        const adults = match ? parseInt(match[1]) : 1;
        return { adults, children: 0 };
      }
      return guests;
    })();
    const { totalAdults, totalChildren } = getGuestSummaryFromObject(normalizedGuests);
    const totalGuests = totalAdults + totalChildren;

    // Updated exceedsCapacity logic as per new rules
    const exceedsCapacity = (() => {
      if (selectedRooms.length === 0) return true;

      // 1 adult per room minimum
      if (totalAdults < selectedRooms.length) return true;

      // Check per room logic: loop through rooms and allocate guests greedily
      let remainingAdults = totalAdults;
      let remainingChildren = totalChildren;

      const sortedRooms = [...selectedRooms].sort((a, b) => {
        const aCap = a.capacity?.maxAdults || 0;
        const bCap = b.capacity?.maxAdults || 0;
        return bCap - aCap; // prioritize rooms with more adult capacity
      });

      for (const room of sortedRooms) {
        const maxAdults = room.capacity?.maxAdults || 0;
        const maxChildren = room.capacity?.maxChildren || 0;

        // First fill adult slots
        const useAdults = Math.min(maxAdults, remainingAdults);
        remainingAdults -= useAdults;

        // Then check if child overflow is allowed
        const useChildren = Math.min(maxChildren, remainingChildren);
        remainingChildren -= useChildren;

        // Special fallback allowance: allow only 1 extra child if 1 or 2 adults exist
        const totalInRoom = useAdults + useChildren;
        if (
          remainingChildren > 0 &&
          ((useAdults === 1 && totalInRoom === 2) || (useAdults === 2 && totalInRoom === 2)) &&
          totalInRoom + 1 <= maxAdults + maxChildren
        ) {
          remainingChildren--;
        }
      }

      return remainingAdults > 0 || remainingChildren > 0;
    })();

    console.log("🧾 Debug Guest Summary", {
      guests,
      selectedRooms,
      totalAdults,
      totalChildren,
      totalGuests,
      exceedsCapacity
    });
    return {
      totalGuests,
      exceedsCapacity,
    };
  }, [guests, selectedRooms]);

  // --- Filtered new room logic: update selectedRooms' prices if availableRooms have changed ---
  // This logic is typically run after availableRooms is updated (e.g., after handleSearchAvailability).
  // Place it in a useEffect that runs when availableRooms changes.
  useEffect(() => {
    if (!availableRooms || availableRooms.length === 0 || selectedRooms.length === 0) return;
    // Only update if both arrays are present
    // For each selectedRoom, see if there's a matching availableRoom by roomId/_id
    const filteredRooms = selectedRooms.filter(r => r.roomId || r._id);
    let anyUpdated = false;
    const updatedSelectedRooms = selectedRooms.map(r => {
      // Only update if this selected room has a roomId/_id
      if (!r.roomId && !r._id) return r;
      // Find matching room in availableRooms
      const matchingRoom = availableRooms.find(ar =>
        ar.roomId === r.roomId ||
        ar._id === r.roomId ||
        ar._id === r._id ||
        ar.roomId === r._id
      );
      if (matchingRoom) {
        // Fallback-safe values for rates
        const newBase = matchingRoom.displayPrice ?? matchingRoom.baseRate ?? matchingRoom.price ?? matchingRoom.totalBeforeTax ?? 0;
        // VAT-inclusive: extract VAT from total
        const newTax = newBase * 0.1 / 1.1;
        const newTotal = newBase; // already VAT-inclusive
        anyUpdated = true;
        return {
          ...r,
          baseRate: newBase,
          taxesAndFees: newTax,
          totalAfterTax: newTotal,
          breakfastIncluded: useBreakfastIncludedRef.current
        };
      }
      return r;
    });
    if (anyUpdated) {
      setSelectedRooms(updatedSelectedRooms);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [availableRooms]);

  if (pageLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-white">
        <motion.div
          className="flex flex-col items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
        >
          <svg className="h-10 w-10 text-[#A58E63] animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
          <p className="mt-2 text-sm text-gray-500">Loading room details...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="bg-white text-gray-800 min-h-screen">
      <Header />
   

      {/* New Home-like Layout */}
      <main className="bg-[#f9f9f9] min-h-screen py-6 pb-32">
        <div className="max-w-7xl mx-auto px-3 sm:px-4">
          <div className="flex flex-col lg:flex-row gap-5">
            {/* Left Column - Main Form */}
            <div className="flex-1 space-y-6">
              {/* Breadcrumbs and Page Title */}
              <div className="pb-0">
                <PageNavigation
                  items={[
                    { label: "Home", href: "/" },
                    { label: "My Reservations", href: "/account/reservations" },
                    { label: "Modify Reservation", current: true }
                  ]}
                />
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-[#2F2F2F] tracking-tight">Modify Your Reservation</h1>
                <p className="text-[#5e5e5e] mt-2 text-sm sm:text-base">
                  Tailor your stay to perfection — update dates, upgrade rooms, or adjust guests.
                </p>
                <HotelProfile propertyId={reservation?.propertyId} />
              </div>

              {/* Update Your Stay */}
              <section className="border p-4 rounded-xl shadow-sm bg-white">
                <h2 className="text-lg font-semibold mb-2">Update Your Stay</h2>
                <ModifyReservationFilters
                  checkIn={checkIn}
                  checkOut={checkOut}
                  guests={guests}
                  onCheckInChange={(val) => {
                    checkInRef.current = val;
                    setCheckIn(val);
                  }}
                  onCheckOutChange={(val) => {
                    checkOutRef.current = val;
                    setCheckOut(val);
                  }}
                  onGuestsChange={(val) => {
                    // Always store guests as an object if possible
                    if (typeof val === 'string') {
                      try {
                        const parsed = JSON.parse(val);
                        if (parsed && typeof parsed === 'object') {
                          setGuests(parsed);
                          guestsRef.current = parsed;
                          return;
                        }
                      } catch (e) {
                        // fallback to original
                      }
                    }
                    setGuests(val);
                    guestsRef.current = val;
                  }}
                  breakfastIncluded={breakfastIncluded}
                  onBreakfastChange={(val) => {
                    setBreakfastIncluded(val);
                    // Do not trigger rate refresh here
                  }}
                  onSearch={() => {
                    handleSearchAvailability();
                  }}
                />
                <div className="flex justify-center items-center mt-2 pt-0">
                  <button
                    className="bg-[#886f48] text-white px-6 py-2 rounded-full hover:opacity-90 transition"
                    onClick={handleSearchAvailability}
                  >
                    Search New Availability
                  </button>
                </div>
              </section>

              {/* Room cards with shimmer loading and toggle */}
              <div className="mt-4">
                <div className="flex justify-center items-center mb-4 mt-2">
                  <button
                    onClick={() => setShowRoomList(prev => !prev)}
                    className="flex items-center gap-1 text-sm text-[#886f48] underline hover:text-[#6d5838] transition"
                  >
                    {showRoomList ? "Hide Room List" : "Show Room List"}
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className={`h-4 w-4 transition-transform ${showRoomList ? "rotate-180" : ""}`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                </div>
                {showRoomList && (loadingRate || availableRooms.length > 0) && (
                  <div className="grid gap-4">
                    {loadingRate
                      ? [1, 2, 3].map((i) => (
                          <SkeletonBlock key={`room-skeleton-${i}`} className="h-[200px] w-full" />
                        ))
                      : availableRooms.map((room) => {
                          const alreadySelected = selectedRooms.some(
                            sel => sel._id === room._id && sel.instanceId
                          );
                          return (
                            <ModifyRoomCard
                              key={room._id}
                              room={room}
                              isSelected={alreadySelected}
                              onSelect={handleRoomSelect}
                              onAddRoom={handleRoomSelect}
                              setSelectedRooms={setSelectedRooms}
                              currencyCode={currencyCode}
                              exchangeRate={exchangeRate}
                              startDate={checkIn}
                              endDate={checkOut}
                              propertyId={reservation?.propertyId}
                            />
                          );
                        })}
                  </div>
                )}
              </div>

              {/* Enhance and Guest Info + Policy */}
              {/* (Keep existing "Enhance Your Stay", "Guest Info", and "Policy Section" here unchanged) */}
              {/* Add-ons Section */}
              {/* Add-on cards: breakfast, transfers, etc.
              
              <section className="border p-4 rounded-xl shadow-sm">
                <h2 className="text-lg font-semibold mb-2">Enhance Your Stay</h2>
                {/* Add-on cards: breakfast, transfers, etc. 
              </section>
              
              */}
              
              

              {/* Guest Info */}
              <section className="border p-4 rounded-xl shadow-sm bg-[#f9f9f9]">
                <h2 className="text-lg font-semibold mb-4">Guest Information</h2>
                <form className="space-y-4">
                  <div>
                    <input
                      type="text"
                      className="w-full rounded-lg border border-gray-300 py-3 px-4 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#886f48]"
                      placeholder="Full Name"
                      defaultValue={reservation?.fullName || ""}
                      required
                    />
                  </div>
                  <div>
                    <input
                      type="email"
                      className="w-full rounded-lg border border-gray-300 py-3 px-4 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#886f48]"
                      placeholder="Email Address"
                      defaultValue={reservation?.email || ""}
                      required
                    />
                  </div>
                  <div>
                    <input
                      type="tel"
                      className="w-full rounded-lg border border-gray-300 py-3 px-4 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#886f48]"
                      placeholder="Phone Number"
                      defaultValue={reservation?.phone || ""}
                      required
                    />
                  </div>
                  <div>
                    <select
                      className="w-full rounded-lg border border-gray-300 py-3 px-4 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-[#886f48]"
                      defaultValue={reservation?.estimatedArrivalTime || ""}
                      required
                    >
                      <option value="">Select Arrival Time</option>
                      <option>08:00 – 09:00</option>
                      <option>09:00 – 10:00</option>
                      <option>10:00 – 11:00</option>
                      <option>11:00 – 12:00</option>
                      <option>12:00 – 13:00</option>
                      <option>13:00 – 14:00</option>
                      <option>14:00 – 15:00</option>
                      <option>15:00 – 16:00</option>
                      <option>16:00 – 17:00</option>
                      <option>17:00 – 18:00</option>
                      <option>18:00 – 19:00</option>
                      <option>19:00 – 20:00</option>
                    </select>
                  </div>
                  <div>
                    <textarea
                      className="w-full rounded-lg border border-gray-300 py-3 px-4 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#886f48]"
                      rows="4"
                      placeholder="Special Requests"
                      defaultValue={reservation?.specialRequest || ""}
                    ></textarea>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-1">Select Bed Preferences</p>
                    <RoomBedSelection
                      selectedRooms={roomsWithBedChoice}
                      onBedChange={(roomId, bed, bedDetails) => {
                        setSelectedRooms((prevRooms) =>
                          prevRooms.map((room) =>
                            room.instanceId === roomId
                              ? { ...room, bedType: bed, ...bedDetails }
                              : room
                          )
                        );
                      }}
                      showError={false}
                      propertyId={reservation?.propertyId}
                    />
                  </div>
                  {/* Optionally, add a Save button for guest info here */}
                  {/* 
                  <div>
                    <button
                      type="button"
                      className="bg-[#886f48] text-white px-4 py-2 rounded-full mt-2"
                      onClick={saveGuestInfoToLocalStorage}
                    >
                      Save Guest Info
                    </button>
                  </div>
                  */}
                </form>
              </section>

              {/* Policy Section */}
              <section className="border p-4 rounded-xl shadow-sm text-sm text-gray-700">
                <h2 className="text-lg font-semibold mb-2">Policies</h2>
                <ul className="list-disc ml-5 space-y-1">
                  {policy?.cancellationPolicy?.cancellationAllowed ? (
                    <li>
                      Free cancellation up to {policy.cancellationPolicy.cancellationNoticeDays} days before check-in
                    </li>
                  ) : (
                    <li>Cancellation not allowed</li>
                  )}
                  <li>
                    Payment methods accepted: {Array.isArray(policy?.paymentMethods) && policy.paymentMethods.length > 0
                      ? policy.paymentMethods.join(", ")
                      : "N/A"}
                  </li>
                  <li>
                    Check-in: {policy?.checkIn || "14:00"} • Check-out: {policy?.checkOut || "12:00"}
                  </li>
                </ul>
              </section>
            </div>

            {/* Sticky Support Button */}
            <div className="fixed bottom-6 pb-12 right-2 z-40 sm:bottom-20 sm:pb-12">
              <SupportButton propertyId={reservation?.propertyId} />
            </div>

            {/* Right Column - Price Summary and Reservation Summary */}
            <aside className="w-full lg:w-[480px] flex-shrink-0 sticky top-6 self-start hidden sm:block">
              <div className="space-y-4">
                {/* Reservation Summary Card */}
                <section className="bg-white rounded-2xl p-4 w-full space-y-3 border border-gray-100">
                  <h2 className="text-lg font-semibold mb-2">Your Current Reservation</h2>
                  {reservation && reservation.rooms?.some(orig => {
                    const match = selectedRooms.find(sel =>
                      sel.roomId === orig.roomId || sel._id === orig._id || sel.instanceId === orig.instanceId
                    );
                    return match && (
                      Math.round((match.baseRate ?? 0) * 100) !== Math.round((orig.baseRate ?? 0) * 100) ||
                      Math.round((match.taxesAndFees ?? 0) * 100) !== Math.round((orig.taxesAndFees ?? 0) * 100) ||
                      Math.round((match.totalAfterTax ?? 0) * 100) !== Math.round((orig.totalAfterTax ?? 0) * 100)
                    );
                  }) && (
                    <div className="flex items-start gap-2 mt-2 mb-4 text-[#7a5b2c] text-sm font-medium">
                      <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      <span>Prices updated for new dates.</span>
                    </div>
                  )}
                  {/* Replace with dynamic reservation info */}
                  {reservation && (
                    <div className="px-0 py-1 space-y-4 text-sm text-gray-700">
                      <div>
                        <div>
                          Reservation #{reservation.referenceNumber} • {reservation.nights} Nights • {reservation.guests}
                        </div>
                        <div>
                          {formatDate(reservation.checkIn)} – {formatDate(reservation.checkOut)}
                        </div>
                        {(checkIn !== reservation.checkIn.slice(0, 10) || checkOut !== reservation.checkOut.slice(0, 10)) && (() => {
                          // Compute new night count after check-in/check-out are updated
                          const newNights = Math.max((new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24), 0);
                          const guestSummary = (() => {
                            let parsedGuests = guestsRef.current;
                            if (typeof parsedGuests === 'string') {
                              try {
                                parsedGuests = JSON.parse(parsedGuests);
                              } catch {
                                const match = parsedGuests.match(/(\d+)/);
                                const adults = match ? parseInt(match[1], 10) : 1;
                                parsedGuests = { adults, children: 0 };
                              }
                            }
                            const { totalAdults, totalChildren } = getGuestSummaryFromObject(parsedGuests);
                            return `${totalAdults} Adults${totalChildren ? `, ${totalChildren} Children` : ''}`;
                          })();
                          return (
                            <div className="text-sm text-gray-500">
                              New Search: {formatDate(checkIn)} – {formatDate(checkOut)} • {newNights} Nights • {guestSummary}
                            </div>
                          );
                        })()}
                        {/* Show rooms from reservation that are NOT removed */}
                        {/* --- MergedRooms logic: merge reservation.rooms with selectedRooms for updated pricing --- */}
                        {(() => {
                          // --- New mergedRooms logic: allow multiple rooms of same type with unique instanceId ---
                          const originalRoomKeys = (reservation.originalRooms || reservation.rooms || [])
                            .map(r => r.instanceId || r.roomId || r._id);
                          const mergedRooms = [];
                          reservation.rooms.forEach((room) => {
                            const matchingRooms = selectedRooms.filter(sel =>
                              sel.roomId === room.roomId || sel._id === room._id
                            );
                            if (matchingRooms.length > 0) {
                              matchingRooms.forEach(match => {
                                mergedRooms.push({ ...room, ...match });
                              });
                            } else {
                              mergedRooms.push(room);
                            }
                          });
                          return (
                            loadingRate ? (
                              <div className="space-y-4">
                                {[1, 2].map((i) => (
                                  <SkeletonBlock key={`summary-${i}`} className="h-[130px] w-full" />
                                ))}
                              </div>
                            ) : (
                              mergedRooms
                                .filter(room => {
                                  // Only show rooms that exist in selectedRooms by unique instanceId
                                  return selectedRooms.some(sel =>
                                    sel.instanceId === room.instanceId
                                  );
                                })
                                .map((room, index) => {
                                  // Enhanced debugging for "Newly Added" detection
                                  const isNewlyAdded = !reservation.rooms?.some(orig => orig.instanceId === room.instanceId);
                                  const matchingSelected = selectedRooms.find(sel =>
                                    sel.roomId === room.roomId || sel._id === room._id || sel.instanceId === room.instanceId
                                  );
                                  const original = (reservation.originalRooms || reservation.rooms || []).find(orig =>
                                    (room.instanceId && orig.instanceId === room.instanceId) ||
                                    (room.roomId && orig.roomId === room.roomId) ||
                                    (room._id && orig._id === room._id)
                                  ) || room;
                                  const updatedRate = matchingSelected || room;
                                  const baseRateChanged = original.baseRate !== undefined && Math.round(updatedRate.baseRate * 100) !== Math.round(original.baseRate * 100);
                                  const taxChanged = original.taxesAndFees !== undefined && Math.round(updatedRate.taxesAndFees * 100) !== Math.round(original.taxesAndFees * 100);
                                  const totalChanged = original.totalAfterTax !== undefined && Math.round(updatedRate.totalAfterTax * 100) !== Math.round(original.totalAfterTax * 100);
                                  const priceChanged = baseRateChanged || taxChanged || totalChanged;
                                  // --- Availability check ---
                                  const matchingAvailable = availableRooms.find(
                                    ar => ar.roomId === updatedRate.roomId || ar._id === updatedRate._id
                                  );
                                  const isUnavailable = matchingAvailable?.unavailable === true;
                                  return (
                                    <div
                                      key={index}
                                      className="flex flex-col sm:flex-row gap-4 border-t border-gray-200 pt-4"
                                    >
                                      <div className="sm:w-24 w-full flex items-start justify-center sm:justify-start pt-3">
                                        {room.image && (
                                          <img
                                            src={room.image}
                                            alt={`Room ${index + 1}`}
                                            className="w-24 h-20 object-cover rounded-lg border border-gray-200 shadow-sm"
                                          />
                                        )}
                                      </div>
                                      <div className="flex-1 text-left space-y-1">
                                        <div className="flex flex-wrap items-center gap-2 mt-1">
                                          <span className="text-sm text-gray-600"> {room.roomType}</span>
                                          {isNewlyAdded ? (
                                            <span className="px-2.5 py-0.5 text-xs border border-green-500 text-green-700 rounded-full font-semibold">
                                              Newly Added
                                            </span>
                                          ) : priceChanged ? (
                                            <span className="px-2.5 py-0.5 text-xs border border-yellow-500 text-yellow-700 rounded-full font-semibold">
                                              Updated Rate
                                            </span>
                                          ) : null}
                                          {isUnavailable && (
                                            <span className="text-xs text-red-600 font-semibold">
                                              Unavailable
                                            </span>
                                          )}
                                        </div>
                                        {isNewlyAdded ? (
                                          <>
                                            <div className={`text-sm mt-1 ${isUnavailable ? 'text-gray-400 line-through' : 'text-gray-600'}`}>
                                              {updatedRate.breakfastIncluded === true ? "Breakfast Included" : "Room Only"}
                                            </div>
                                            <div className={`text-sm mt-1 ${isUnavailable ? 'text-gray-400 line-through' : 'text-gray-600'}`}>
                                              Base Rate: {formatCurrency(updatedRate.baseRate, exchangeRate, currencyCode)}
                                            </div>
                                            <div className={`text-sm mt-1 ${isUnavailable ? 'text-gray-400 line-through' : 'text-gray-600'}`}>
                                              Tax: {formatCurrency(updatedRate.taxesAndFees, exchangeRate, currencyCode)}
                                            </div>
                                            <div className={`text-sm mt-1 ${isUnavailable ? 'text-gray-400 line-through' : 'text-gray-600'}`}>
                                              Final Rate: {formatCurrency(updatedRate.totalAfterTax, exchangeRate, currencyCode)}
                                            </div>
                                          </>
                                        ) : priceChanged ? (
                                          <div className="mb-2">
                                            <div className={`text-sm mt-1 ${isUnavailable ? 'text-gray-400 line-through' : 'text-gray-600'}`}>
                                              {updatedRate.breakfastIncluded === true ? "Breakfast Included" : "Room Only"}
                                            </div>
                                            <div className={`text-sm mt-1 ${isUnavailable ? 'text-gray-400 line-through' : 'text-gray-600'}`}>
                                              Base Rate:
                                              <span className="line-through text-gray-400 ml-2">{formatCurrency(original.baseRate, exchangeRate, currencyCode)}</span>
                                              <span className="ml-2 text-green-600 font-semibold">{formatCurrency(updatedRate.baseRate, exchangeRate, currencyCode)}</span>
                                            </div>
                                            <div className={`text-sm mt-1 ${isUnavailable ? 'text-gray-400 line-through' : 'text-gray-600'}`}>
                                              Tax:
                                              <span className="line-through text-gray-400 ml-2">{formatCurrency(original.taxesAndFees, exchangeRate, currencyCode)}</span>
                                              <span className="ml-2 text-green-600 font-semibold">{formatCurrency(updatedRate.taxesAndFees, exchangeRate, currencyCode)}</span>
                                            </div>
                                            <div className={`text-sm mt-1 ${isUnavailable ? 'text-gray-400 line-through' : 'text-gray-600'}`}>
                                              Final Rate:
                                              <span className="line-through text-gray-400 ml-2">{formatCurrency(original.totalAfterTax, exchangeRate, currencyCode)}</span>
                                              <span className="ml-2 text-green-600 font-semibold">{formatCurrency(updatedRate.totalAfterTax, exchangeRate, currencyCode)}</span>
                                            </div>
                                          </div>
                                        ) : (
                                          <>
                                            <div className={`text-sm mt-1 ${isUnavailable ? 'text-gray-400 line-through' : 'text-gray-600'}`}>
                                              {updatedRate.breakfastIncluded === true ? "Breakfast Included" : "Room Only"}
                                            </div>
                                            <div className={`text-sm mt-1 ${isUnavailable ? 'text-gray-400 line-through' : 'text-gray-600'}`}>
                                              Base Rate: {formatCurrency(updatedRate.baseRate, exchangeRate, currencyCode)}
                                            </div>
                                            <div className={`text-sm mt-1 ${isUnavailable ? 'text-gray-400 line-through' : 'text-gray-600'}`}>
                                              Tax: {formatCurrency(updatedRate.taxesAndFees, exchangeRate, currencyCode)}
                                            </div>
                                            <div className={`text-sm mt-1 ${isUnavailable ? 'text-gray-400 line-through' : 'text-gray-600'}`}>
                                              Final Rate: {formatCurrency(updatedRate.totalAfterTax, exchangeRate, currencyCode)}
                                            </div>
                                          </>
                                        )}
                                        <button
                                          className="mt-2 text-sm text-red-500 hover:underline"
                                          onClick={() => {
                                            setSelectedRooms(prev =>
                                              prev.filter(sel =>
                                                sel.instanceId !== room.instanceId
                                              )
                                            );
                                          }}
                                        >
                                          Remove
                                        </button>
                                      </div>
                                    </div>
                                  );
                                })
                            )
                          );
                        })()}
                        {/* Show newly added rooms (from selectedRooms, not in reservation.rooms) */}
                        {selectedRooms
                          .filter(sel => {
                            const isNew =
                              !reservation.rooms?.some(room =>
                                room.roomId === sel.roomId || room._id === sel.roomId || room._id === sel._id
                              );
                            return isNew && sel.baseRate !== undefined && sel.totalAfterTax !== undefined;
                          })
                          .map((room, idx) => {
                            return (
                              <div
                                key={room.instanceId || room.roomId || idx}
                                className="flex flex-col sm:flex-row gap-4 border-t border-gray-200 pt-0"
                              >
                                <div className="sm:w-24 w-full flex items-start justify-center sm:justify-start pt-4">
                                  {room.image && (
                                    <img
                                      src={room.image}
                                      alt={`Room ${idx + 1}`}
                                      className="w-24 h-20 object-cover rounded-lg border border-gray-200 shadow-sm"
                                    />
                                  )}
                                </div>
                                <div className="flex-1 text-left space-y-1">
                                  <div className="flex flex-wrap items-center gap-2 mt-1">
                                    <span className="text-sm text-gray-600">{room.roomType}</span>
                                    <span className="px-2.5 py-0.5 text-xs border border-green-500 text-green-700 rounded-full font-semibold">
                                      Newly Added
                                    </span>
                                  </div>
                                  <div className="text-sm text-gray-600 mt-1">
                                    {room.breakfastIncluded === true ? "Breakfast Included" : "Room Only"}
                                  </div>
                                  <div className="text-sm text-gray-600 mt-1">
                                    Base Rate: {formatCurrency(room.baseRate, exchangeRate, currencyCode)}
                                  </div>
                                  <div className="text-sm text-gray-600 mt-1">
                                    Tax: {formatCurrency(room.taxesAndFees, exchangeRate, currencyCode)}
                                  </div>
                                  <div className="text-sm text-gray-600 mt-1">
                                    Total After Tax: {formatCurrency(room.totalAfterTax, exchangeRate, currencyCode)}
                                  </div>
                                  <button
                                    className="mt-2 text-sm text-red-500 hover:underline"
                                    onClick={() => {
                                      setSelectedRooms(prev =>
                                        prev.filter(sel =>
                                          sel.instanceId !== room.instanceId
                                        )
                                      );
                                    }}
                                  >
                                    Remove
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                      </div>
                    </div>
                  )}
                </section>
                {/* Price Summary Box */}
                {loadingRate ? (
                  <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100 w-[480px]">
                    <h2 className="text-lg font-semibold mb-2">Price Summary</h2>
                    <div className="space-y-3">
                      <SkeletonBlock className="h-5 w-1/2" />
                      <SkeletonBlock className="h-4 w-full" />
                      <SkeletonBlock className="h-4 w-3/4" />
                      <SkeletonBlock className="h-4 w-1/2" />
                    </div>
                  </div>
                ) : (
                  <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100 w-[480px]">
                    <h2 className="text-lg font-semibold mb-2">Price Summary</h2>
                    <div className="text-sm text-gray-700 space-y-2">
                      <div className="flex justify-between">
                        <span>Room subtotal</span><span>{formatCurrency(subtotal, exchangeRate, currencyCode)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Includes VAT</span><span>{formatCurrency(taxTotal, exchangeRate, currencyCode)}</span>
                      </div>
                      <div className="flex justify-between font-semibold">
                        <span>Total</span><span>{formatCurrency(total, exchangeRate, currencyCode)}</span>
                      </div>
                    </div>
                    <button
                      className={`mt-4 w-full px-4 py-2 rounded-full transition disabled:opacity-40 disabled:cursor-not-allowed ${
                        availableSelectedRooms.length === 0 || exceedsCapacity
                          ? "bg-gray-400"
                          : "bg-[#886f48] hover:opacity-90 text-white"
                      }`}
                      onClick={() => {
                        saveGuestInfoToLocalStorage();
                        if (
                          selectedRooms.some((room) => {
                            const match = availableRooms.find(
                              (ar) =>
                                ar.roomId === room.roomId ||
                                ar._id === room.roomId ||
                                ar._id === room._id
                            );
                            return match?.unavailable === true;
                          })
                        ) {
                          setShowUnavailableMessage(true);
                          return;
                        }
                        const { totalAdults, totalChildren } = getGuestSummaryFromObject(guests);
                        // Persist selectedRooms before navigating
                        localStorage.setItem("selectedRooms", JSON.stringify(selectedRooms));
                        navigate("/modification-confirmation", {
                          state: {
                            reservationId: reservation?.reservationId || reservation?._id || "",
                            dateRange: { checkIn, checkOut },
                            guests: {
                              adults: totalAdults,
                              children: totalChildren
                            },
                            totalGuests
                          }
                        });
                      }}
                      disabled={availableSelectedRooms.length === 0 || exceedsCapacity}
                    >
                      Continue to Confirmation
                    </button>
                    {exceedsCapacity && (
                      <p className="mt-2 text-center text-red-600 text-sm font-medium">
                        Add more rooms to accommodate {totalGuests} guests.
                      </p>
                    )}
                    {availableSelectedRooms.length === 0 && !exceedsCapacity ? (
                      <p className="mt-2 text-center text-red-600 text-sm font-medium">
                        Please select at least one room to continue.
                      </p>
                    ) : showUnavailableMessage && !exceedsCapacity && (
                      <p className="mt-2 text-center text-red-600 text-sm font-medium">
                        Some rooms are unavailable. Please update your reservation.
                      </p>
                    )}
                  </div>
                )}
              </div>
            </aside>
          </div>
        </div>
      </main>

      {/* Sticky mobile summary bar (mobile only) */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-30 flex justify-between items-center px-4 py-3 sm:hidden shadow-sm">
        <div className="text-sm text-gray-700">
          <span className="text-xs uppercase text-gray-400 block">Total</span>
          <span className="text-lg font-semibold text-[#2f2f2f]">
            {
              formatCurrency(
                selectedRooms
                  .filter((room) => {
                    const match = availableRooms.find(
                      (ar) => ar.roomId === room.roomId || ar._id === room.roomId || ar._id === room._id
                    );
                    return !(match?.unavailable === true);
                  })
                  .reduce((sum, room) => sum + (room.totalAfterTax || 0), 0),
                exchangeRate,
                currencyCode
              )
            }
          </span>
        </div>
        <button
          onClick={() => setShowMobileSummary(true)}
          className="bg-[#7A6442] hover:bg-[#6d5838] text-white px-5 py-2.5 rounded-full text-sm shadow-md transition-all duration-200"
        >
          View Summary
        </button>
      </div>

      {/* Mobile reservation summary modal */}
      <MobileReservationSummary
        isOpen={showMobileSummary}
        onClose={() => setShowMobileSummary(false)}
        reservation={reservation}
        selectedRooms={selectedRooms}
        exchangeRate={exchangeRate}
        currencyCode={currencyCode}
        setSelectedRooms={setSelectedRooms}
        searchStart={checkIn}
        searchEnd={checkOut}
        availableRooms={availableRooms}
        onConfirm={() => navigate("/modification-confirmation")}
      />

      {/* Footer (Optional) */}
      <footer className="mt-12 text-center text-sm text-gray-400 py-6">
        &copy; 2025 Eightfold Urban Resort. All rights reserved.
      </footer>
    </div>
  );
};

export default ModifyReservationPage;
