import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Header from '../components/Header';
import HeroBanner from '../components/HeroBanner';
import HotelFacilitySection from '../components/HotelFacilitySection';
import HotelPolicySection from '../components/HotelPolicySection';
import BookingSearchBox from '../components/BookingSearchBox';
import MobileBookingModal from '../components/MobileBookingModal';
import MobileStickyCTA from '../components/MobileStickyCTA';

const HotelPolicyPage = () => {
  const propertyId = import.meta.env.VITE_EIGHTFOLD_PROPERTY_ID;
  const [selectedDates, setSelectedDates] = useState({
    startDate: new Date(),
    endDate: new Date(),
  });
  const [rooms, setRooms] = useState([{ adults: 1, children: 0 }]);
  const [showPicker, setShowPicker] = useState(false);
  const [showGuests, setShowGuests] = useState(false);
  const [showRates, setShowRates] = useState(false);
  const [showMobileCalendar, setShowMobileCalendar] = useState(false);
  const [selectedRate, setSelectedRate] = useState('');

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      className="bg-white"
    >
      <Header />
      <HeroBanner
        backgroundImage="/hotel1.webp"
        title="Hotel Policies"
        subtitle="Review our check-in/out times, deposit requirements, cancellation rules, and guest policies."
      />
      {/* Desktop Booking Box */}
      <div className="hidden md:block">
        <BookingSearchBox
          selectedDates={selectedDates}
          setSelectedDates={setSelectedDates}
          rooms={rooms}
          setRooms={setRooms}
          showPicker={showPicker}
          setShowPicker={setShowPicker}
          showGuests={showGuests}
          setShowGuests={setShowGuests}
          onSearch={() => {
            console.log('Search clicked', selectedDates, rooms);
          }}
        />
      </div>

      {/* Mobile Booking Modal */}
      <MobileBookingModal
        showRates={showRates}
        setShowRates={setShowRates}
        showMobileCalendar={showMobileCalendar}
        setShowMobileCalendar={setShowMobileCalendar}
        selectedDates={selectedDates}
        setSelectedDates={setSelectedDates}
        rooms={rooms}
        setRooms={setRooms}
        selectedRate={selectedRate}
        setSelectedRate={setSelectedRate}
      />
        {/* Mobile Sticky CTA */}
            <MobileStickyCTA onClick={() => setShowRates(true)} />

       {/* Policy Section */}
        <div className="bg-white py-16 px-4">
          <HotelPolicySection propertyId={propertyId} />
        </div>
    </motion.div>
  );
};

export default HotelPolicyPage;