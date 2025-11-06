import React, { useEffect, useState } from "react";
import Header from "../components/Header";
import MobileStepper from "../components/MobileStepper";
import BookingSummaryBox from "../components/BookingSummaryBox";
import SupportButton from "../components/SupportButton";
import { useNavigate } from "react-router-dom";
import PriceSummary from "../components/PriceSummary";
import MobilePriceSummary from "../components/MobilePriceSummary";
import TotalPriceSummary from "../components/TotalPriceSummary";
import GuestCountSummary from "../components/GuestCountSummary";
import { useSelectedRooms } from "../contexts/SelectedRoomsContext";
import { useSelectedServices } from "../contexts/SelectedServicesContext";
import { useSelectedDate } from "../contexts/SelectedDateContext";
import { getSelectedRooms } from "../utils/localStorageManager";
import Breadcrumbs from '../components/Breadcrumbs';
import { getAuth } from "firebase/auth";
import { useAuth } from "../contexts/AuthContext";
import {
  Hotel,
  Calendar,
  CarFront,
  BedDouble,
  Mail,
  PhoneCall,
  User,
  DoorOpen,
  Star,
  Globe,
  HelpCircle,
  UtensilsCrossed,
  Moon,
  Clock
} from "lucide-react";
import {
  IconPoolView,
  IconLandmarkView,
  IconFreeWiFi,
  IconTerrace
} from "../components/SvgIcons";
import { motion } from "framer-motion";
const hotel = JSON.parse(localStorage.getItem("selectedHotel")) || {};
const fallbackPropertyId = hotel.propertyId || hotel._id;

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

const PaymentConfirmationPage = ({ propertyId: passedPropertyId }) => {
  const { user } = useAuth();
  const propertyId = passedPropertyId || fallbackPropertyId;
  const navigate = useNavigate();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  const { selectedRooms } = useSelectedRooms();
  const { selectedServices } = useSelectedServices();
  const dateContext = useSelectedDate();
  let range = {};
  if (dateContext?.range?.from && dateContext?.range?.to) {
    range = dateContext.range;
  } else {
    try {
      const storedRange = localStorage.getItem("selectedRange");
      if (storedRange) {
        const parsed = JSON.parse(storedRange);
        if (parsed?.from && parsed?.to) {
          range = parsed;
        }
      } else {
        const from = localStorage.getItem("selectedStartDate");
        const to = localStorage.getItem("selectedEndDate");
        if (from && to) {
          range = { from, to };
        }
      }
    } catch (e) {
      console.error("❌ Failed to parse selectedRange:", e);
    }
  }
  const nights =
    selectedRooms?.[0]?.nights > 0
      ? selectedRooms[0].nights
      : dateContext.nights || Number(localStorage.getItem('selectedNights')) || 1;
  const property = dateContext.property;

  const [propertyData, setPropertyData] = React.useState(null);
  const [showMobileSummary, setShowMobileSummary] = React.useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const url = `${import.meta.env.VITE_API_BASE_URL}/api/property?propertyId=${propertyId}`;
    fetch(url)
      .then(res => res.json())
      .then(data => {
        console.log("🏨 Loaded propertyData:", data); // <-- Debugging console
        setPropertyData(data);
        setIsLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch property data:", err);
        setIsLoading(false);
      });
  }, [propertyId]);

  const guestInfo = JSON.parse(localStorage.getItem("guestInfo") || "{}");
  const rawNumAdults = localStorage.getItem("numAdults");
  const rawNumChildren = localStorage.getItem("numChildren");
  const guestAdults = Number(rawNumAdults) || 0;
  const guestChildren = Number(rawNumChildren) || 0;
  const totalPrice = localStorage.getItem("totalPrice") || 0;

  const handleBack = () => {
    navigate("/guest-info");
  };

  const handleConfirm = async () => {
    setIsSubmitting(true);
    const guestInfo = JSON.parse(localStorage.getItem("guestInfo") || "{}");
    const selectedBeds = JSON.parse(localStorage.getItem("selectedBeds") || "{}");

    const auth = getAuth();
    const currentUser = auth.currentUser;
    const firebaseUid = currentUser?.uid || null;

    // Fetch stay preferences from user profile if available
    const stayPreferences = user?.profile?.stayPreferences || {};

    const bookingData = {
      propertyId,
      fullName: guestInfo.fullName || `${guestInfo.firstName || ""} ${guestInfo.lastName || ""}`.trim(),
      email: guestInfo.email,
      phone: guestInfo.phoneNumber,
      countryCode: guestInfo.countryCode,
      nationality: guestInfo.nationality,
      checkIn: range?.from,
      checkOut: range?.to,
      price: Number(totalPrice),
      guests: `${guestAdults} adult${guestAdults > 1 ? "s" : ""}${guestChildren > 0 ? `, ${guestChildren} child${guestChildren > 1 ? "ren" : ""}` : ""}`,
      breakfastIncluded: selectedRooms?.[0]?.breakfastIncluded || false,
      roomId: selectedRooms?.[0]?.roomId,
      roomName: selectedRooms?.[0]?.roomName || selectedRooms?.[0]?.name,
      roomRate: selectedRooms?.[0]?.basePriceRoomOnly || 0,
      nights, // Explicitly include the calculated nights value
      numberOfRooms: selectedRooms.length,
      numberOfGuests: guestInfo.guestSummary || `${guestAdults} adults${guestChildren > 0 ? `, ${guestChildren} child` : ""}`,
      bedType: selectedBeds[selectedRooms?.[0]?.instanceId] || "",
      specialRequest: localStorage.getItem("specialRequest") || "",
      estimatedArrivalTime: localStorage.getItem("arrivalTime") || "",
      roomTypes: selectedRooms.map(r => r.roomName || r.name || ""),
      rooms: selectedRooms.map((room) => {
        const baseRate =
          room.basePriceRoomOnly ||
          room.promotionRoomOnlyRate ||
          room.roomOnlyRate ||
          room.price ||
          0;
        const vat = propertyData?.policy?.vat?.percentage || 10;
        console.log("[🔢 VAT used]", vat);
        const totalAfterTax = baseRate;
        const totalBeforeTax = baseRate * 100 / (100 + vat);
        const taxesAndFees = totalAfterTax - totalBeforeTax;
        const perNightRate = nights > 0 ? baseRate / nights : 0;
        const perNightPrices = Array.from({ length: nights }, () => perNightRate);
        const rateCurrency = "USD";
        const ratePlanId = room.ratePlanId || "standard-flexible";
        // Log breakdown for debugging
        console.log("[💸 Room rate breakdown]", { baseRate, nights, perNightPrices, totalBeforeTax, taxesAndFees, totalAfterTax });
        return {
          roomId: room.roomId || room._id,
          roomType: room.roomName || room.name,
          bedType: selectedBeds[room.instanceId] || roomDetailsMap[room.roomId]?.fixedBedSetup?.join(" + ") || "",
          bedCountLabel:
            roomDetailsMap[room.roomId]?.requiresBedChoice === true
              ? selectedBeds[room.instanceId] === "single beds"
                ? roomDetailsMap[room.roomId]?.singleBedCount
                  ? `${roomDetailsMap[room.roomId].singleBedCount} single bed${roomDetailsMap[room.roomId].singleBedCount > 1 ? "s" : ""}`
                  : ""
                : roomDetailsMap[room.roomId]?.doubleBedCount
                  ? `${roomDetailsMap[room.roomId].doubleBedCount} large double bed${roomDetailsMap[room.roomId].doubleBedCount > 1 ? "s" : ""}`
                  : ""
              : [
                  roomDetailsMap[room.roomId]?.doubleBedCount
                    ? `${roomDetailsMap[room.roomId].doubleBedCount} large double bed${roomDetailsMap[room.roomId].doubleBedCount > 1 ? "s" : ""}`
                    : null,
                  roomDetailsMap[room.roomId]?.singleBedCount
                    ? `${roomDetailsMap[room.roomId].singleBedCount} single bed${roomDetailsMap[room.roomId].singleBedCount > 1 ? "s" : ""}`
                    : null
                ].filter(Boolean).join(", ").replace(/,\s*$/, ""),
          baseRate,
          vat,
          totalBeforeTax,
          taxesAndFees,
          totalAfterTax,
          nights,
          perNightPrices,
          rateCurrency,
          ratePlanId,
          breakfastIncluded: room.breakfastIncluded || false,
          image: room.image || roomDetailsMap[room.roomId]?.images?.[0] || "",
          capacity: room.capacity || roomDetailsMap[room.roomId]?.capacity || {},
        };
      }),
      firebaseUid,
      stayPreferences,
    };
    console.log("[🧾 bookingData.rooms]", bookingData.rooms);
    console.log("[🧾 Full bookingData payload]", bookingData);

    try {
      const response = await fetch(`${import.meta.env.VITE_BOOKING_API_URL}/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(bookingData)
      });

      const result = await response.json();
      if (result.success) {
        // Clear selected room-related localStorage on successful booking
        localStorage.removeItem("selectedRooms");
        localStorage.removeItem("selectedRoomsTimestamp");
        navigate(`/booking-success/${result.booking._id}`, { replace: true });
      } else {
        alert("Booking failed: " + result.message);
      }
    } catch (err) {
      console.error("Booking error:", err);
      alert("An error occurred while confirming your booking.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper for stepper
  const steps = [
    { label: "Choose Room", icon: <BedDouble className="w-4 h-4 mr-1" /> },
    { label: "Guest Info", icon: <User className="w-4 h-4 mr-1" /> },
    { label: "Confirmation", icon: <Calendar className="w-4 h-4 mr-1" /> },
  ];
  // Room and property for info block
  // Room details map for each selected room
  const [roomDetailsMap, setRoomDetailsMap] = useState({});

  useEffect(() => {
    selectedRooms.forEach(room => {
      const roomId = room.roomId;
      if (roomId && !roomDetailsMap[roomId]) {
        fetch(`${import.meta.env.VITE_API_BASE_URL}/api/rooms/${roomId}?propertyId=${propertyId}`)
          .then((res) => {
            if (!res.ok) throw new Error("Room not found");
            return res.json();
          })
          .then((data) => {
            setRoomDetailsMap(prev => ({ ...prev, [roomId]: data }));
          })
          .catch((err) => console.error("Failed to fetch room details:", err));
      }
    });
  }, [selectedRooms, propertyId]);

  const propertyName = property?.name || propertyData?.name || hotel?.name || "Property Name";
  const propertyCity = property?.address?.city || propertyData?.address?.city || hotel?.city || "City";
  const propertyRating = property?.rating || propertyData?.rating || hotel?.rating || 4.5;
  const hotelClass = property?.hotelClass || propertyData?.hotelClass || hotel?.hotelClass || "5-star";
  const checkIn = range?.from && !isNaN(Date.parse(range.from)) ? new Date(range.from) : null;
  const checkOut = range?.to && !isNaN(Date.parse(range.to)) ? new Date(range.to) : null;
  // Format helpers
  function formatDate(date) {
    if (!date) return "";
    return date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
  }
  // Fetch selectedBeds from localStorage
  const selectedBeds = JSON.parse(localStorage.getItem("selectedBeds") || "{}");
  // Helper to format list with commas and "or"
  function formatListWithOr(list) {
    if (!list || list.length === 0) return "";
    if (list.length === 1) return list[0];
    return `${list.slice(0, -1).join(", ")} or ${list[list.length - 1]}`;
  }
  // Responsive grid
  return (
    <motion.div
      className="min-h-screen bg-[#f8f9fa] pb-10 px-2"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="w-full">
        <Header />
        {/* Mobile Stepper */}
        <div className="block sm:hidden px-4 pt-4">
          <MobileStepper current="Confirmation" />
        </div>
      </div>

      {/* Progress Stepper */}
      <div className="max-w-4xl mx-auto px-4 pt-8 hidden sm:block">
        <Breadcrumbs current="Confirmation" />
      </div>

      <div className="max-w-7xl mx-auto pt-2 px-4 lg:px-6">
        

        <h2 className="text-2xl font-bold mb-5 text-center lg:text-left">Booking Confirmation</h2>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-8">
          {/* Left/Main Content */}
          <div>

                 {/* Room Details Block */}
            <div className="bg-white border border-gray-100 shadow-sm rounded-2xl p-5 mb-5">
              <div className="flex flex-col gap-4">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                  {/* Check-in */}
                  <div className="flex flex-col items-center gap-1">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4 text-[#A58E63]" />
                      <span className="text-xs text-gray-500">Check-in</span>
                    </div>
                    <span className="font-semibold text-sm">{formatDate(checkIn)}</span>
                  </div>
                  {/* Check-out */}
                  <div className="flex flex-col items-center gap-1">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4 text-[#A58E63]" />
                      <span className="text-xs text-gray-500">Check-out</span>
                    </div>
                    <span className="font-semibold text-sm">{formatDate(checkOut)}</span>
                  </div>
                  {/* Nights */}
                  <div className="flex flex-col items-center gap-1">
                    <div className="flex items-center gap-1">
                      <Moon className="w-4 h-4 text-[#A58E63]" />
                      <span className="text-xs text-gray-500">Nights</span>
                    </div>
                    <span className="font-semibold text-sm">{nights}</span>
                  </div>
                  {/* Rooms */}
                  <div className="flex flex-col items-center gap-1">
                    <div className="flex items-center gap-1">
                      <Hotel className="w-4 h-4 text-[#A58E63]" />
                      <span className="text-xs text-gray-500">Rooms</span>
                    </div>
                    <span className="font-semibold text-sm">{selectedRooms.length}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Booking Summary Box (Mobile only) */}
            <div className="pt-0.5 block">
              {selectedRooms && selectedRooms.length > 0 && (
                <div className="mb-2 lg:hidden">
                  <BookingSummaryBox
                    hotel={propertyData || hotel}
                    image={propertyData?.images?.[0] || hotel.images?.[0] || ""}
                    stayPeriod={{
                      start: localStorage.getItem('selectedStartDate'),
                      end: localStorage.getItem('selectedEndDate'),
                      nights: Math.max(
                        Math.floor(
                          (new Date(localStorage.getItem('selectedEndDate')) - new Date(localStorage.getItem('selectedStartDate')))
                          / (1000 * 60 * 60 * 24)
                        ), 1),
                    }}
                    guestCount={{
                      adults: Number(localStorage.getItem('numAdults')) || 0,
                      children: Number(localStorage.getItem('numChildren')) || 0,
                    }}
                    selectedRooms={selectedRooms}
                    onShowDetails={() => console.log('Show details clicked')}
                  />
                </div>
              )}
            </div>
            {/* Guest Summary Block for Mobile */}
            <div className="block sm:hidden mb-4">
              <GuestCountSummary
                onShowDetails={() => setShowMobileSummary(true)}
                nights={nights}
                range={range}
                selectedRooms={selectedRooms}
                selectedServices={selectedServices}
                totalPrice={totalPrice}
                propertyId={propertyId || propertyData?._id}
              />
            </div>
            {/* Info card above title */}
            {isLoading ? (
              <div className="space-y-3">
                <SkeletonBlock className="h-5 w-3/4" />
                <SkeletonBlock className="h-4 w-2/4" />
                <SkeletonBlock className="h-4 w-full" />
              </div>
            ) : (
              <>
                {selectedRooms.map((room, index) => {
                  const roomType = room.roomType || room.roomName || "";
                  const bedType = selectedBeds[room.instanceId] || room.bedType || "";
                  const image = room.image;
                  const roomId = room.roomId;
                  const details = roomDetailsMap[roomId];
                  return (
                    <div key={index} className="flex flex-col sm:flex-row items-center sm:items-stretch bg-white border border-gray-200 rounded-2xl shadow-sm py-3 px-4 mb-4 gap-4">
                      <div className="w-full sm:w-48 h-36 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100 flex items-center justify-center ">
                        {image ? (
                          <img
                            src={image}
                            alt={roomType || "Room"}
                            className="object-cover w-full h-full"
                          />
                        ) : (
                          <div className="text-gray-400 text-sm">No image</div>
                        )}
                      </div>
                      <div className="flex-1 flex flex-col justify-between pl-0 sm:pl-4 py-2">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-lg">{roomType || "Room Type"}</span>
                          </div>

                          {/* Bed Type */}
                          {bedType && (
                            <div className="text-xs text-gray-500 flex items-center gap-1">
                              <span className="text-gray-700 font-medium text-sm flex items-center gap-2">
                                {bedType === "large double bed" && details?.doubleBedCount ? (
                                  <>
                                    <span className="w-5 h-5 text-[#A58E63] flex items-center justify-center" aria-hidden="true">
                                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18px" fill="currentColor">
                                        <path d="M3.75 11.25V9a.75.75 0 0 1 .75-.75h6a.75.75 0 0 1 .75.75v2.25a.75.75 0 0 0 1.5 0V9a2.25 2.25 0 0 0-2.25-2.25h-6A2.25 2.25 0 0 0 2.25 9v2.25a.75.75 0 0 0 1.5 0m9 0V9a.75.75 0 0 1 .75-.75h6a.75.75 0 0 1 .75.75v2.25a.75.75 0 0 0 1.5 0V9a2.25 2.25 0 0 0-2.25-2.25h-6A2.25 2.25 0 0 0 11.25 9v2.25a.75.75 0 0 0 1.5 0m-10 .75h18.5c.69 0 1.25.56 1.25 1.25V18l.75-.75H.75l.75.75v-4.75c0-.69.56-1.25 1.25-1.25m0-1.5A2.75 2.75 0 0 0 0 13.25V18c0 .414.336.75.75.75h22.5A.75.75 0 0 0 24 18v-4.75a2.75 2.75 0 0 0-2.75-2.75zM0 18v3a.75.75 0 0 0 1.5 0v-3A.75.75 0 0 0 0 18m22.5 0v3a.75.75 0 0 0 1.5 0v-3a.75.75 0 0 0-1.5 0m-.75-6.75V4.5a2.25 2.25 0 0 0-2.25-2.25h-15A2.25 2.25 0 0 0 2.25 4.5v6.75a.75.75 0 0 0 1.5 0V4.5a.75.75 0 0 1 .75-.75h15a.75.75 0 0 1 .75.75v6.75a.75.75 0 0 0 1.5 0"></path>
                                      </svg>
                                    </span>
                                    {`${details.doubleBedCount} large double bed${details.doubleBedCount > 1 ? "s" : ""}`}
                                  </>
                                ) : bedType === "single beds" && details?.singleBedCount ? (
                                  <>
                                    <div className="flex items-center gap-1 text-[#A58E63]" aria-hidden="true">
                                      {Array.from({ length: details.singleBedCount }).map((_, idx) => (
                                        <span key={idx} className="w-5 h-5 flex items-center justify-center">
                                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18px" fill="currentColor">
                                            <path d="M2.75 12h18.5c.69 0 1.25.56 1.25 1.25V18l.75-.75H.75l.75.75v-4.75c0-.69.56-1.25 1.25-1.25m0-1.5A2.75 2.75 0 0 0 0 13.25V18c0 .414.336.75.75.75h22.5A.75.75 0 0 0 24 18v-4.75a2.75 2.75 0 0 0-2.75-2.75zM0 18v3a.75.75 0 0 0 1.5 0v-3A.75.75 0 0 0 0 18m22.5 0v3a.75.75 0 0 0 1.5 0v-3a.75.75 0 0 0-1.5 0m-.75-6.75V4.5a2.25 2.25 0 0 0-2.25-2.25h-15A2.25 2.25 0 0 0 2.25 4.5v6.75a.75.75 0 0 0 1.5 0V4.5a.75.75 0 0 1 .75-.75h15a.75.75 0 0 1 .75.75v6.75a.75.75 0 0 0 1.5 0m-13.25-3h7a.25.25 0 0 1 .25.25v2.75l.75-.75h-9l.75.75V8.5a.25.25 0 0 1 .25-.25m0-1.5A1.75 1.75 0 0 0 6.75 8.5v2.75c0 .414.336.75.75.75h9a.75.75 0 0 0 .75-.75V8.5a1.75 1.75 0 0 0-1.75-1.75z"></path>
                                          </svg>
                                        </span>
                                      ))}
                                    </div>
                                    {`${details.singleBedCount} single bed${details.singleBedCount > 1 ? "s" : ""}`}
                                  </>
                                ) : bedType === "1 double bed 1 single bed" &&
                                  details?.doubleBedCount &&
                                  details?.singleBedCount ? (
                                  <>
                                    <BedDouble className="w-4 h-4 text-[#A58E63]" />
                                    {`${details.doubleBedCount} double bed, ${details.singleBedCount} single bed`}
                                  </>
                                ) : (
                                  bedType
                                )}
                              </span>
                            </div>
                          )}
                          {/* Bed Setup Fallback */}
                          {!bedType && details?.fixedBedSetup?.length > 0 && (
                            <div className="text-xs text-gray-500 flex items-center gap-1">
                              <span className="text-gray-700 font-medium text-sm flex items-center gap-2">
                                {details.fixedBedSetup.map((bed, idx) => {
                                  if (bed.includes("double") && details.doubleBedCount > 0) {
                                    return (
                                      <span key={`double-${idx}`} className="flex items-center gap-1">
                                        {Array.from({ length: details.doubleBedCount }).map((_, i) => (
                                          <svg key={i} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18px" fill="currentColor" className="text-[#A58E63]">
                                            <path d="M3.75 11.25V9a.75.75 0 0 1 .75-.75h6a.75.75 0 0 1 .75.75v2.25a.75.75 0 0 0 1.5 0V9a2.25 2.25 0 0 0-2.25-2.25h-6A2.25 2.25 0 0 0 2.25 9v2.25a.75.75 0 0 0 1.5 0m9 0V9a.75.75 0 0 1 .75-.75h6a.75.75 0 0 1 .75.75v2.25a.75.75 0 0 0 1.5 0V9a2.25 2.25 0 0 0-2.25-2.25h-6A2.25 2.25 0 0 0 11.25 9v2.25a.75.75 0 0 0 1.5 0m-10 .75h18.5c.69 0 1.25.56 1.25 1.25V18l.75-.75H.75l.75.75v-4.75c0-.69.56-1.25 1.25-1.25m0-1.5A2.75 2.75 0 0 0 0 13.25V18c0 .414.336.75.75.75h22.5A.75.75 0 0 0 24 18v-4.75a2.75 2.75 0 0 0-2.75-2.75zM0 18v3a.75.75 0 0 0 1.5 0v-3A.75.75 0 0 0 0 18m22.5 0v3a.75.75 0 0 0 1.5 0v-3a.75.75 0 0 0-1.5 0m-.75-6.75V4.5a2.25 2.25 0 0 0-2.25-2.25h-15A2.25 2.25 0 0 0 2.25 4.5v6.75a.75.75 0 0 0 1.5 0V4.5a.75.75 0 0 1 .75-.75h15a.75.75 0 0 1 .75.75v6.75a.75.75 0 0 0 1.5 0"></path>
                                          </svg>
                                        ))}
                                        <span>{`${details.doubleBedCount} large double bed${details.doubleBedCount > 1 ? "s" : ""}`}</span>
                                      </span>
                                    );
                                  } else if (bed.includes("single") && details.singleBedCount > 0) {
                                    return (
                                      <span key={`single-${idx}`} className="flex items-center gap-1">
                                        {Array.from({ length: details.singleBedCount }).map((_, i) => (
                                          <svg key={i} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18px" fill="currentColor" className="text-[#A58E63]">
                                            <path d="M2.75 12h18.5c.69 0 1.25.56 1.25 1.25V18l.75-.75H.75l.75.75v-4.75c0-.69.56-1.25 1.25-1.25m0-1.5A2.75 2.75 0 0 0 0 13.25V18c0 .414.336.75.75.75h22.5A.75.75 0 0 0 24 18v-4.75a2.75 2.75 0 0 0-2.75-2.75zM0 18v3a.75.75 0 0 0 1.5 0v-3A.75.75 0 0 0 0 18m22.5 0v3a.75.75 0 0 0 1.5 0v-3a.75.75 0 0 0-1.5 0m-.75-6.75V4.5a2.25 2.25 0 0 0-2.25-2.25h-15A2.25 2.25 0 0 0 2.25 4.5v6.75a.75.75 0 0 0 1.5 0V4.5a.75.75 0 0 1 .75-.75h15a.75.75 0 0 1 .75.75v6.75a.75.75 0 0 0 1.5 0m-13.25-3h7a.25.25 0 0 1 .25.25v2.75l.75-.75h-9l.75.75V8.5a.25.25 0 0 1 .25-.25m0-1.5A1.75 1.75 0 0 0 6.75 8.5v2.75c0 .414.336.75.75.75h9a.75.75 0 0 0 .75-.75V8.5a1.75 1.75 0 0 0-1.75-1.75z"></path>
                                          </svg>
                                        ))}
                                        <span>{`${details.singleBedCount} single bed${details.singleBedCount > 1 ? "s" : ""}`}</span>
                                      </span>
                                    );
                                  }
                                  return null;
                                })}
                              </span>
                            </div>
                          )}

                          {/* Breakfast */}
                          {room?.breakfastIncluded !== undefined && (
                            <div className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                              {room.breakfastIncluded ? (
                                <>
                                  <UtensilsCrossed className="w-4 h-4 text-[#A58E63]" />
                                  <span className="text-gray-700 font-medium text-sm">Breakfast Included</span>
                                </>
                              ) : (
                                <span className="text-gray-700 font-medium text-sm">Room Only</span>
                              )}
                            </div>
                          )}

                          {/* Room Features */}
                          {details?.roomFeatures?.length > 0 && (() => {
                            const features = details.roomFeatures;
                            const topFeatures = [];

                            if (features.includes("Private Suite")) {
                              topFeatures.push("Private Suite");
                            }

                            if (features.includes("Pool Access")) {
                              topFeatures.push("Pool Access");
                            } else if (features.includes("Pool View")) {
                              topFeatures.push("Pool View");
                            } else if (features.includes("Landmark view")) {
                              topFeatures.push("Landmark view");
                            }

                            if (features.includes("Free WiFi")) {
                              topFeatures.push("Free WiFi");
                            }

                            if (features.includes("Terrace")) {
                              topFeatures.push("Terrace");
                            }

                            return (
                              <ul className="flex flex-wrap gap-x-4 gap-y-1 mt-1">
                                {topFeatures.map((feature, i) => {
                                  // Add Private Suite SVG inline before the icon logic
                                  if (feature === "Private Suite") {
                                    return (
                                      <li key={i} className="flex items-center gap-1 text-sm text-gray-600">
                                        <svg className="w-4 h-4 text-[#A58E63]" viewBox="0 0 24 24" fill="currentColor">
                                          <path d="M9.094 10.879a1.125 1.125 0 1 0 1.134 1.116v-.003c.002-.61-.5-1.115-1.121-1.117h-.006a.75.75 0 1 0 .004 1.5h-.002a.376.376 0 0 1-.375-.368.375.375 0 1 1 .378.372.75.75 0 0 0-.012-1.5zM15.75 3.75h4.5a.75.75 0 0 1 .75.75v15a.75.75 0 0 1-.75.75h-4.5a.75.75 0 0 0 0 1.5h4.5a2.25 2.25 0 0 0 2.25-2.25v-15a2.25 2.25 0 0 0-2.25-2.25h-4.5a.75.75 0 0 0 0 1.5zM12 22.503l-9-1.285V3.725l9.023-2.227-.023.005v21.001zm-.212 1.485a1.5 1.5 0 0 0 1.712-1.484v-21A1.5 1.5 0 0 0 11.686.037L2.663 2.263A1.493 1.493 0 0 0 1.5 3.726v17.492c0 .747.55 1.38 1.289 1.485l8.999 1.285z"></path>
                                        </svg>
                                        {feature}
                                      </li>
                                    );
                                  }
                                  let IconComponent = null;
                                  if (feature === "Pool Access") IconComponent = IconPoolView;
                                  if (feature === "Pool View") IconComponent = IconPoolView;
                                  else if (feature === "Landmark view") IconComponent = IconLandmarkView;
                                  else if (feature === "Free WiFi") IconComponent = IconFreeWiFi;
                                  else if (feature === "Terrace") IconComponent = IconTerrace;

                                  return (
                                    <li key={i} className="flex items-center gap-1 text-sm text-gray-600">
                                      {IconComponent ? (
                                        <IconComponent className="w-4 h-4 text-[#A58E63]" />
                                      ) : (
                                        <svg viewBox="0 0 20 20" fill="none" className="w-4 h-4 text-[#A58E63]" xmlns="http://www.w3.org/2000/svg">
                                          <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.5"/>
                                          <path d="M6 10l2.5 2.5L14 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                        </svg>
                                      )}
                                      {feature}
                                    </li>
                                  );
                                })}
                              </ul>
                            );
                          })()}
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Service Summary Block */}
                {selectedServices?.length > 0 && (
                  <div className="bg-white border border-gray-100 shadow-sm rounded-2xl p-5 mb-6">
                    <h3 className="text-lg font-bold mb-4">Selected Services</h3>
                    <div className="flex flex-col gap-2">
                      {selectedServices.map((service, i) => {
                        const transport = service.selectedTransport || service.transportType || service.category;
                        return (
                          <div key={i} className="flex flex-col sm:flex-row items-center sm:items-stretch bg-white border border-gray-200 rounded-2xl shadow-sm py-3 px-4 mb-4 gap-4">
                            <div className="w-full sm:w-48 h-36 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100 flex items-center justify-center ">
                              {service.image ? (
                                <img src={service.image} alt={service.name} className="object-cover w-full h-full" />
                              ) : (
                                <div className="text-gray-400 text-sm">No image</div>
                              )}
                            </div>
                            <div className="flex-1 flex flex-col justify-center items-center sm:items-start text-center sm:text-left pl-0 sm:pl-4 py-2">
                              <div className="flex flex-col gap-1 items-center sm:items-start text-center sm:text-left">
                                <div className="flex items-center gap-2">
                                  <span className="font-semibold text-lg">
                                    {service.title || service.name || service.serviceName || service.category || "Service"}
                                  </span>
                                </div>
                                {transport && (
                                  <div className="text-xs text-gray-600 mt-0.5 flex items-center gap-1">
                                    <CarFront className="w-4 h-4 text-[#A58E63]" />
                                    <span className="text-gray-600 font-medium text-sm">Transport: {transport}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </>
            )}
           

            {/* Guest Info Block */}
            <div className="bg-white border border-gray-100 shadow-sm rounded-2xl p-5 mb-5">
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2 mb-1">
                  <User className="w-5 h-5 text-[#A58E63]" />
                  <span className="font-semibold text-base">Guest Info</span>
                </div>
                <div className="flex flex-col gap-1 pl-1">
                  <div className="flex items-center gap-1">
                    <User className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-500 text-xs font-medium">Name:</span>
                    <span className="font-medium text-sm text-gray-700">
                      {guestInfo.fullName || `${guestInfo.firstName || ""} ${guestInfo.lastName || ""}`.trim() || "—"}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-500 text-xs font-medium">Email:</span>
                    <span className="font-medium text-sm text-gray-700">{guestInfo.email || "—"}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <PhoneCall className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-500 text-xs font-medium">Phone:</span>
                    <span className="font-medium text-sm text-gray-700">
                      {guestInfo.phoneNumber ? `${guestInfo.countryCode || ""} ${guestInfo.phoneNumber}` : "—"}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Globe className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-500 text-xs font-medium">Nationality:</span>
                    <span className="font-medium text-sm text-gray-700">
                      {guestInfo.nationality || "—"}
                    </span>
                  </div>
                  {/* Total Guests */}
                  {(guestAdults || guestChildren) && (
                    <div className="flex items-center gap-1">
                      <User className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-500 text-xs font-medium">Guests:</span>
                      <span className="font-medium text-sm text-gray-700">
                        {guestAdults} adult{guestAdults > 1 ? "s" : ""}
                        {guestChildren > 0 ? `, ${guestChildren} child${guestChildren > 1 ? "ren" : ""}` : ""}
                      </span>
                    </div>
                  )}
                  {/* Arrival Time */}
                  {localStorage.getItem("arrivalTime") && (
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-500 text-xs font-medium">Arrival Time:</span>
                      <span className="font-medium text-sm text-gray-700">
                        {localStorage.getItem("arrivalTime")}
                      </span>
                    </div>
                  )}
                  {/* Check-in & Check-out Policy */}
                  {(propertyData?.policy?.checkIn || propertyData?.policy?.checkOut) && (
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-500 text-xs font-medium">Policy:</span>
                      <span className="font-medium text-sm text-gray-700">
                        {`Check-in ${propertyData?.policy?.checkIn || ""} • Check-out ${propertyData?.policy?.checkOut || ""}`}
                      </span>
                    </div>
                  )}
                  {/* Special Requests */}
                  {localStorage.getItem("specialRequest") && (
                    <div className="flex items-start gap-1">
                      <Mail className="w-4 h-4 text-gray-400 mt-[2px]" />
                      <span className="text-gray-500 text-xs font-medium">Special Request:</span>
                      <span className="font-medium text-sm text-gray-700">
                        {localStorage.getItem("specialRequest")}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Payment & Cancellation Info */}
            <div className="bg-white border border-gray-100 shadow-sm rounded-2xl p-5 mb-5">
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2 mb-1">
                  <DoorOpen className="w-5 h-5 text-[#A58E63]" />
                  <span className="font-semibold text-base">Payment & Cancellation</span>
                </div>
                {/* Dynamic Payment Methods */}
                {propertyData?.policy?.paymentMethods?.length > 0 && (
                  <div className="pl-1 text-gray-700 text-sm">
                    Payment at hotel ({formatListWithOr(propertyData.policy.paymentMethods)}). No prepayment required.
                  </div>
                )}
                {/* Dynamic Cancellation Policy */}
                {propertyData?.policy?.cancellationPolicy?.cancellationAllowed ? (
                  propertyData.policy.cancellationPolicy.cancellationNoticeDays === 0 ? (
                    <div className="pl-1 text-gray-700 text-sm">
                      Free cancellation is allowed up to the day of check-in. Please notify the property in advance for any changes or cancellations.
                    </div>
                  ) : (
                    <div className="pl-1 text-gray-700 text-sm">
                      Free cancellation up to {propertyData.policy.cancellationPolicy.cancellationNoticeDays} day
                      {propertyData.policy.cancellationPolicy.cancellationNoticeDays > 1 ? "s" : ""} before check-in.Please notify the property in advance for any changes or cancellations.
                    </div>
                  )
                ) : (
                  <div className="pl-1 text-gray-700 text-sm">
                    Cancellation is not allowed for this booking.
                  </div>
                )}
              </div>
            </div>

            {/* Total Price (Mobile Only) */}
            <div className="block sm:hidden mt-4">
              <TotalPriceSummary
                selectedRooms={selectedRooms}
                selectedServices={selectedServices}
                nights={nights}
                propertyId={propertyId || propertyData?._id}
              />
            </div>

            {/* Confirm Button */}
            <div className="flex justify-center mt-8">
              <button
                onClick={handleConfirm}
                className="bg-[#A58E63] hover:bg-[#927b58] text-white font-semibold py-3 px-10 rounded-full shadow transition flex items-center justify-center gap-2 disabled:opacity-50"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                    </svg>
                    Booking...
                  </>
                ) : (
                  "Confirm Booking"
                )}
              </button>
            </div>
          </div>

          {/* Price Summary (Desktop) */}
          <div className="hidden lg:block w-[480px] pr-4 pt-2 sticky top-6 self-start bg-white rounded-2xl shadow-md p-6 border border-gray-100">
            {isLoading || !(propertyId || propertyData?._id) ? (
              <div className="space-y-3">
                <SkeletonBlock className="h-5 w-1/2" />
                <SkeletonBlock className="h-5 w-3/4" />
                <SkeletonBlock className="h-5 w-full" />
              </div>
            ) : (
              <PriceSummary
                selectedRooms={selectedRooms}
                selectedServices={selectedServices}
                totalPrice={totalPrice}
                nights={nights}
                propertyId={propertyId || propertyData?._id}
                onRemoveRoom={() => {}}
                labelTotal="Total Charges"
                showVatBreakdown={true}
              />
            )}
          </div>
        </div>

        {/* Mobile Price Summary */}
        <div className="lg:hidden mt-8">
          {isLoading || !(propertyId || propertyData?._id) ? (
            <div className="space-y-3">
              <SkeletonBlock className="h-5 w-1/2" />
              <SkeletonBlock className="h-5 w-3/4" />
              <SkeletonBlock className="h-5 w-full" />
            </div>
          ) : (
            <>
              {!showMobileSummary && (
                <div className="px-4">
                  <GuestCountSummary
                    onShowDetails={() => setShowMobileSummary(true)}
                    nights={nights}
                    range={range}
                    selectedRooms={selectedRooms}
                    selectedServices={selectedServices}
                    totalPrice={totalPrice}
                    propertyId={propertyId || propertyData?._id}
                  />
                </div>
              )}
              {showMobileSummary && (
                <MobilePriceSummary
                  selectedRooms={selectedRooms}
                  selectedServices={selectedServices}
                  totalPrice={totalPrice}
                  nights={nights}
                  propertyId={propertyId || propertyData?._id}
                  onRemoveRoom={() => {}}
                  onConfirm={handleConfirm}
                  labelTotal="Total Charges"
                  showVatBreakdown={true}
                />
              )}
            </>
          )}
        </div>
      </div>
      <div className="fixed bottom-4 right-0 z-50">
      <SupportButton propertyId={propertyId} />
      </div>

       {/* Bottom Nav Buttons */}
       <div className="mt-6 flex justify-between items-center max-w-7xl mx-auto px-4">
        <button
          onClick={() => window.history.back()}
          className="text-gray-600 hover:underline text-sm"
        >
          ← Go Back
        </button>
        {/*<div className="flex gap-3">
          <button
            onClick={() => window.location.href = "/confirmation"}
            className="text-blue-600 hover:underline text-sm"
          >
            Continue →
          </button>
        </div>
        */}
      </div>
    </motion.div>
  );
};

export default PaymentConfirmationPage;