import React, { useEffect, useState, useContext, useRef } from 'react';
import { useCurrency } from '../contexts/CurrencyProvider';
import { formatCurrency } from '../utils/formatCurrency';
import Header from '../components/Header';
import MobileStepper from '../components/MobileStepper';
import PriceSummary from '../components/PriceSummary';
import MobileBookingCart from '../components/MobileBookingCart';
import MobilePriceSummary from '../components/MobilePriceSummary';
import { isMobile } from "react-device-detect";
import { useSelectedRooms } from '../contexts/SelectedRoomsContext';
import { useSelectedServices } from '../contexts/SelectedServicesContext';
import TourDetailModal from '../components/TourDetailModal';
import { useClickOutside } from '../hooks/useClickOutside';
import Breadcrumbs from '../components/Breadcrumbs';
import { useLocation } from 'react-router-dom';
import SupportButton from "../components/SupportButton";

const ServiceOptionsPage = () => {
  const { selectedRooms } = useSelectedRooms();
  const location = useLocation();
  const pathSequence = ["/", "/service-options", "/guest-info", "/payment", "/confirmation"];
  const currentPath = location.pathname;
  const currentIndex = pathSequence.indexOf(currentPath);
  const nextPath = pathSequence[currentIndex + 1] || "/confirmation";
  const hotel = JSON.parse(localStorage.getItem('selectedHotel')) || {};
  console.log('[ServiceOptionsPage] Loaded hotel from localStorage:', hotel);
  const propertyId = hotel.propertyId || hotel._id;

  if (!propertyId) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Hotel info not found. Please go back and select your room again.
      </div>
    );
  }

  const { exchangeRate, currencyCode, currencySign } = useCurrency();

  const { selectedServices, addService, removeService, updateService } = useSelectedServices();


  const [services, setServices] = useState([]);
  const [selectedService, setSelectedService] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showMobileSummary, setShowMobileSummary] = useState(false);
  const [selectedTransportMap, setSelectedTransportMap] = useState({});

  const modalRef = useRef(null);
  useClickOutside(modalRef, () => setShowDetailModal(false));

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_BASE_URL}/api/services?propertyId=${propertyId}`)
      .then((res) => res.json())
      .then((data) => {
        const sorted = (data || []).sort((a, b) => (a.priority || 0) - (b.priority || 0));
        setServices(sorted.filter((s) => s.isFeatured));
      });
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const goToNext = () => {
    setShowMobileSummary(false);
    setTimeout(() => {
      window.location.href = nextPath;
    }, 100);
  };

  const goBack = () => {
    if (isMobile) {
      window.location.href = '/';
    } else {
      window.history.back();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      {isMobile && (
        <div className="px-2 pt-2 sm:hidden">
          <MobileStepper />
        </div>
      )}
      <div className="max-w-4xl mx-auto px-4 pt-8 hidden sm:block">
        <Breadcrumbs
          steps={[
            { label: "Search", href: "/search" },
            { label: "Select Room", href: "/search" },
            { label: "Add-ons", current: true },
            { label: "Guest Info & Payment" },
          ]}
        />
      </div>

      <div className="max-w-7xl mx-auto px-2 sm:px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-10">
          {/* Left: Add-ons and Titles */}
          <div className="flex-1">
            {/* Title & Step Indicator */}
            <div className="mb-6 text-center sm:text-left">
            <h1 className="text-2xl sm:text-3xl font-light text-gray-900 tracking-wide text-center sm:text-left ">
                Enhance Your Stay with Personalized Add-ons
              </h1>
              <p className="text-gray-500 text-sm sm:text-base font-light mt-1 text-center sm:text-left">
                Curated experiences and services designed for your comfort and convenience
              </p>
            </div>

            {services.length > 0 && (
              <div className="flex flex-wrap gap-6">
                {services.map((service) => {
                  const selectedTransport = selectedTransportMap[service._id] || service.transportation?.defaultType || service.transportation?.availableTypes?.[0];
                  const updateSelectedTransport = (value) => {
                    setSelectedTransportMap(prev => ({ ...prev, [service._id]: value }));
                  };
                  const isUSDBase = service?.currency === "USD" || !service?.currency;
                  const rawPrice = Number(service?.price);
                  const basePrice = !isNaN(rawPrice) && rawPrice > 0 ? rawPrice : null;

                  const priceForTransport = service.transportation?.[selectedTransport?.toLowerCase()]?.price || basePrice;
                  const convertedPrice = isUSDBase ? priceForTransport * exchangeRate : priceForTransport;

                  const formattedPrice = basePrice !== null && currencyCode
                    ? formatCurrency(convertedPrice, 1, currencyCode) // exchangeRate already applied
                    : '--';
                  const handleToggleService = () => {
                    const exists = selectedServices.find((s) => s._id === service._id);
                    if (exists) {
                      removeService(service._id);
                    } else {
                      addService({
                        ...service,
                        selectedTransport,
                        transportPrice: priceForTransport,
                        image: service.imageUrls?.[0] || "",
                      });
                      updateService(service._id, {
                        selectedTransport,
                        transportPrice: priceForTransport,
                      });
                    }
                  };
                  return (
                  <div key={service._id} className="bg-white rounded-xl shadow-md border border-gray-100 w-full sm:w-[340px] transition-transform hover:shadow-lg hover:-translate-y-1">
                    <img src={service.imageUrls?.[0]} alt={service.category} className="w-full h-[180px] object-cover rounded-t-xl" />
                    <div className="px-6 py-5 flex flex-col h-[200px]">
                      <div className="flex-1">
                        <h2 className="text-lg font-medium text-gray-700 mb-1 tracking-tight">{service.category}</h2>
                        <p className="text-sm text-gray-500 mb-3 font-light line-clamp-3 leading-snug">{service.description}</p>
                        <div className="mt-3 space-y-2">
                          <div className="flex justify-between items-center">
                            <button
                              onClick={() => {
                                setSelectedService(service);
                                setShowDetailModal(true);
                              }}
                              className="text-primary-600 text-sm underline hover:text-primary-700 transition text-left font-light"
                            >
                              See details
                            </button>
                            {service.transportation?.allowChoice && service.transportation?.availableTypes?.length > 0 && (
                              <select
                                value={selectedTransport}
                                onChange={(e) => updateSelectedTransport(e.target.value)}
                                className="text-sm border border-gray-300 rounded px-2 py-1"
                              >
                                {service.transportation.availableTypes.map((type) => (
                                  <option key={type} value={type}>{type}</option>
                                ))}
                              </select>
                            )}
                          </div>
                          <div className="flex justify-between items-center mt-2">
                            <span className="text-base font-medium text-primary-600">
                              {formattedPrice ? `${formattedPrice}` : '--'}
                            </span>
                            <button
                              onClick={handleToggleService}
                              className={`rounded-md border text-sm font-semibold px-4 py-2 transition-all duration-200 ${
                                selectedServices.some((s) => s._id === service._id)
                                  ? 'bg-primary-600 text-white border-primary-600'
                                  : 'bg-white text-primary-600 border-primary-600 hover:bg-primary-50'
                              }`}
                            >
                              {selectedServices.some((s) => s._id === service._id) ? (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 00-1.414 0L9 11.586 6.707 9.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l7-7a1 1 0 000-1.414z" clipRule="evenodd" />
                                </svg>
                              ) : 'Add'}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  );
                })}
              </div>
            )}

          </div>

          {/* Right Sidebar: Desktop Price Summary */}
          {!isMobile && (
              <div className="hidden lg:block w-[480px] pr-4 pt-2 sticky top-6 self-start bg-white rounded-2xl shadow-md p-6 border border-gray-100">

              <PriceSummary
                selectedRooms={selectedRooms}
                onRemoveRoom={() => {}}
                propertyId={propertyId}
              />
            </div>
          )}
        </div>

        <div className="fixed bottom-28 pb-10 right-6 z-50">
      <SupportButton propertyId={propertyId} />
      </div>

        {/* Bottom Nav Buttons (moved outside flex container) */}
        <div className="mt-10 flex justify-between items-center max-w-7xl mx-auto px-4">
          <button onClick={goBack} className="text-gray-600 hover:underline text-sm">← Go Back</button>
          <div className="flex gap-3">
            <button onClick={goToNext} className="text-gray-600 hover:underline text-sm">Skip This Step →</button>
            <button onClick={goToNext} className="text-blue-600 hover:underline text-sm">Continue →</button>
          </div>
        </div>

        {/* Mobile View */}
        {isMobile && (
          <div className="pb-[140px]">
            <div className="flex flex-col items-center">
              <MobileBookingCart property={hotel} onExpand={() => setShowMobileSummary(true)} />
            </div>
            {showMobileSummary && (
              <>
                {console.log('[ServiceOptionsPage] Rendering MobilePriceSummary with:', {
                  property: hotel,
                  propertyId,
                })}
                <MobilePriceSummary
                  onConfirm={() => setShowMobileSummary(false)}
                  nights={1}
                  startDate={null}
                  endDate={null}
                  totalAdults={2}
                  totalChildren={0}
                  property={hotel}
                  propertyId={propertyId}
                  onRemoveRoom={() => {}}
                />
              </>
            )}
            <div className="hidden">
              <PriceSummary
                selectedRooms={selectedRooms}
                onRemoveRoom={() => {}}
                propertyId={propertyId}
              />
            </div>
          </div>
        )}
        {showDetailModal && selectedService && (
          <TourDetailModal
            tour={selectedService}
            onClose={() => setShowDetailModal(false)}
            modalRef={modalRef}
          />
        )}
      </div>
    </div>
  );
};

export default ServiceOptionsPage;
