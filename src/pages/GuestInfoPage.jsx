import React, { useEffect, useState } from 'react';
import { motion } from "framer-motion";
import { useLocation, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Breadcrumbs from '../components/Breadcrumbs';
import MobileStepper from '../components/MobileStepper';
import GuestInfoForm from '../components/GuestInfoForm';
import RoomBedSelection from '../components/RoomBedSelection';
import PriceSummary from '../components/PriceSummary';
import MobilePriceSummary from '../components/MobilePriceSummary';
import GuestCountSummary from '../components/GuestCountSummary';
import { useSelectedRooms } from '../contexts/SelectedRoomsContext';
import SpecialRequestBox from '../components/SpecialRequestBox';
import {ArrivalTimeBox} from '../components/ArrivalTimeBox';
import LoyaltyPromptBox from '../components/LoyaltyPromptBox';
import BookingSummaryBox from '../components/BookingSummaryBox';
import { useAuth } from '../contexts/AuthContext';
import UserProfileInfo from '../components/UserProfileInfo';
import SupportButton from "../components/SupportButton";

const hotel = JSON.parse(localStorage.getItem('selectedHotel')) || {};
const propertyId = hotel.propertyId || hotel._id;

const GuestInfoPage = () => {
  const location = useLocation();
  const [services, setServices] = useState([]);
  const { selectedRooms, setSelectedRooms } = useSelectedRooms();
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [showError, setShowError] = useState(false);
  const [bedSelectionErrors, setBedSelectionErrors] = useState({});

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const [propertyData, setPropertyData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const url = `${import.meta.env.VITE_API_BASE_URL}/api/property?propertyId=${propertyId}`;
    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        setPropertyData(data);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch property data:", err);
        setIsLoading(false);
      });
  }, []);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_BASE_URL}/api/services?propertyId=${propertyId}`)
      .then((res) => res.json())
      .then((data) => {
        const sorted = (data || []).sort((a, b) => (a.priority || 0) - (b.priority || 0));
        setServices(sorted.filter((s) => s.isFeatured));
      });
  }, []);

  const updateRoomBedType = async (roomId, bedType) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/rooms/${roomId}?propertyId=${propertyId}`);
      const roomData = await res.json();

      setSelectedRooms(prevRooms =>
        prevRooms.map(room => {
          if (room.id === roomId || room.roomId === roomId) {
            const requiresBedChoice = roomData.requiresBedChoice;
            return {
              ...room,
              bedType,
              requiresBedChoice,
              bedTypes: roomData.bedTypes,
              doubleBedCount: roomData.doubleBedCount,
              singleBedCount: roomData.singleBedCount
            };
          }
          return room;
        })
      );
    } catch (err) {
      console.error("❌ Failed to fetch room details:", err);
    }
  };

  const handleBedChange = (roomId, newBedType) => {
    updateRoomBedType(roomId, newBedType);
    setBedSelectionErrors(prev => ({
      ...prev,
      [roomId]: false,
    }));
  };

  const handleConfirm = () => {
    if (!selectedRooms || selectedRooms.length === 0) {
      console.log("🚫 No rooms selected. showError set to true.");
      setShowError(true);
      return;
    }

    const guestInfo = JSON.parse(localStorage.getItem('guestInfo') || '{}');
    const agreed = guestInfo.agree === true;

    const isGuestInfoValid =
      guestInfo.firstName &&
      guestInfo.lastName &&
      guestInfo.email &&
      guestInfo.phoneNumber &&
      guestInfo.countryCode &&
      guestInfo.nationality;

    const selectedBeds = JSON.parse(localStorage.getItem("selectedBeds") || "{}");
    console.log("🧠 All selectedRooms in confirm():", selectedRooms);
    const missingBeds = {};
    selectedRooms.forEach((room) => {
      const requiresChoice =
        (Array.isArray(room.bedTypes) && room.bedTypes.length > 1) ||
        (room.doubleBedCount || 0) > 0 ||
        (room.singleBedCount || 0) > 0;
      console.log("🛠 Debug bed info:", {
        bedTypes: room.bedTypes,
        double: room.doubleBedCount,
        single: room.singleBedCount
      });
      const id = room.instanceId;
      const hasValidSelection = selectedBeds[id] && selectedBeds[id].trim().length > 0;

      console.log("🔬 Full room in confirm():", room);
      console.log(`🔍 Room ${id}: requiresChoice=${requiresChoice}, bedType="${selectedBeds[id]}"`);

      if (requiresChoice && !hasValidSelection) {
        missingBeds[id] = true;
      }
    });

    setBedSelectionErrors(missingBeds);
    console.log("🛏️ Bed selection errors updated:", missingBeds);
    console.log("❌ Missing bed errors detected:", missingBeds);
    const hasBedErrors = Object.keys(missingBeds).length > 0;
    if (hasBedErrors) {
      setShowError(true);
    }

    console.log("🚨 Validation debug:", {
      guestInfo,
      agreed,
      selectedRooms,
      missingBeds,
      hasBedErrors,
      isGuestInfoValid
    });

    if (!isGuestInfoValid || hasBedErrors || !agreed) {
      setTimeout(() => {
        console.log("⚠️ Validation failed. Triggering showError.");
        setShowError(true);
      }, 0);
      return;
    }

    // Only navigate if all validations pass
    navigate('/confirmation');
  };

  // const propertyData = hotel;

  return (
    <motion.div
      className="min-h-screen bg-[#f8f9fa] pb-10"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Header />

      <div className="block lg:hidden mb-[-20px]">
        <MobileStepper step={2} />
      </div>

      <div className="hidden pt-8 lg:block">
        <Breadcrumbs current="Guest Info" />
      </div>

      <div className="flex flex-col lg:flex-row lg:items-start max-w-7xl mx-auto px-4 py-6 gap-6">
        <div className="flex-1 w-full">

        <div className="pt-0.5 block ">
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
                      adults: Number(localStorage.getItem('numAdults')) || 2,
                      children: Number(localStorage.getItem('numChildren')) || 0,
                    }}
                    selectedRooms={selectedRooms}
                    onShowDetails={() => console.log('Show details clicked')}
                  />
                </div>
              )}
            </div>
          {!loading && !user && (
            <div className="pb-6">
              <LoyaltyPromptBox />
            </div>
          )}
          <div className="p-6 border border-gray-200 rounded-lg bg-white">
            {user && (
              <>
                <UserProfileInfo />
                <GuestInfoForm user={user} showError={showError} />
              </>
            )}
            {!user && (
              <GuestInfoForm user={{}} showError={showError} />
            )}
          </div>
        </div>
          <div className="mt-1">
            {selectedRooms && selectedRooms.length > 0 && (
              <RoomBedSelection
                selectedRooms={selectedRooms.map(room => ({
                  ...room,
                  uniqueKey: room.instanceId || room.id || room.roomId
                }))}
                onBedChange={handleBedChange}
                showError={showError}
                bedSelectionErrors={bedSelectionErrors}
              />
            )}
          </div>
          <div className="mt-4">
            <SpecialRequestBox />
            <ArrivalTimeBox />
          </div>

          <div className="flex justify-center mt-6 px-4">
            <button
              onClick={handleConfirm}
              className="flex items-center justify-center gap-2 bg-[#886f48] text-white text-base font-semibold px-6 py-3 rounded-full hover:opacity-90 transition"
            >
              <span>Next: Final step</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
      {showError && (
        <p className="text-red-600 text-sm mt-2 text-center">
          Please fill all required information.
        </p>
      )}
      <div className="fixed bottom-4 right-0 z-50">
      <SupportButton propertyId={propertyId} />
      </div>
        </div>

        
        
        <div className="hidden lg:block w-[480px] pr-4 pt-2 sticky top-6 self-start bg-white rounded-2xl shadow-md p-6 border border-gray-100">
          <PriceSummary propertyId={propertyId} hideContinueButton={true} />
        </div>
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

      {/* Mobile price summary removed */}

      
    </motion.div>
  );
};

export default GuestInfoPage;
