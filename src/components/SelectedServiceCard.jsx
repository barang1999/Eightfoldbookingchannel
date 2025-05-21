import React, { useState, useEffect } from 'react';
import { useSelectedServices } from '../contexts/SelectedServicesContext';
import { formatCurrency } from '../utils/formatCurrency';
import { useCurrency } from '../contexts/CurrencyProvider';
import { useLocation } from 'react-router-dom';

const SelectedServiceCard = ({ service }) => {
  const { removeService, selectedTransportOptions } = useSelectedServices();
  const { currency, exchangeRate } = useCurrency();
  const [showDetails, setShowDetails] = useState(false);
  const location = useLocation();

  const vatPercentage = parseFloat(localStorage.getItem('vatPercentage') || '10');

  const {
    title,
    category,
    duration,
    price,
    vat,
    image,
    images,
    imageUrls,
  } = service || {};

  const selectedTransport = service.selectedTransport || selectedTransportOptions?.[service.instanceId];
  const transportData = service?.transportation?.[selectedTransport?.toLowerCase()];
  const dynamicPrice = transportData?.price ?? price;
  const dynamicVat = dynamicPrice * (vatPercentage / 100);

  useEffect(() => {
    
  }, [service?.selectedTransport]);

  return (
    <>
      <div
        className={`border-t border-gray-200 transition-colors duration-300 rounded-md hover:bg-gray-50 overflow-hidden mb-0.5 cursor-pointer`}
        onClick={() => setShowDetails(!showDetails)}
      >
        <div className="flex justify-between items-center text-sm">
          <div className="flex items-start gap-4">
            <img
              src={image || images?.[0] || imageUrls?.[0] || "https://upload.wikimedia.org/wikipedia/commons/6/65/No-Image-Placeholder.svg"}
              className="w-20 h-16 object-cover rounded border border-gray-200"
            />
            <div className="flex flex-col gap-0.5 flex-grow">
              <div className="flex justify-between items-start w-full">
                <span className="text-gray-700 font-bold">{category}</span>
                {!["/confirmation", "/guest-info"].includes(location.pathname) && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeService(service.instanceId);
                    }}
                    className="text-gray-400 hover:text-red-500 transition-colors duration-200 text-xs ml-2"
                    title="Remove service"
                  >
                    ✕
                  </button>
                )}
              </div>
              
              {selectedTransport && (
                <span className="text-xs text-gray-500 italic">Transport: {selectedTransport}</span>
              )}
              {typeof vat === "number" && (
                <span className="text-gray-400 text-xs">
                  VAT: {formatCurrency(dynamicVat, exchangeRate, currency)}
                </span>
              )}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowDetails(!showDetails);
                }}
                className="text-xs text-blue-600 underline hover:text-blue-800 mt-0.5 text-left"
              >
                {showDetails ? "Hide details" : "See details"}
              </button>
            </div>
          </div>
          <div className="flex items-center flex-col justify-between gap-1">
            <span className="text-m font-midium text-gray-800">
              {formatCurrency(dynamicPrice + dynamicVat, exchangeRate, currency)}
            </span>
            <button onClick={(e) => {
              e.stopPropagation();
              setShowDetails(!showDetails);
            }} className="transition-transform duration-300">
              <svg className={`w-4 h-4 transform ${showDetails ? "rotate-180" : "rotate-0"} transition-transform duration-300`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>
          </div>
        </div>
      </div>
      <div
        className={`transition-all duration-300 ${showDetails ? "bg-gray-50 rounded-md mt-2" : ""} ${showDetails ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"} overflow-hidden`}
      >
        <div className="p-3 pt-2 space-y-1 text-sm text-gray-700 max-h-70 overflow-y-auto">
          <div>
            <div className="font-bold text-xs text-gray-500">SERVICE</div>
            <div className="mt-1">{category}</div>
            <div className="text-xs text-gray-500 italic">{duration}</div>
            {selectedTransport && (
              <div className="text-xs text-gray-500 italic">Transport: {selectedTransport}</div>
            )}
            {service?.description && (
              <div className="text-xs text-gray-600 mt-2">{service.description}</div>
            )}
          </div>
          <div className="border-t border-gray-200 pt-1">
            <div className="font-bold text-xs text-gray-500">TAXES AND FEES</div>
            <div className="flex justify-between text-sm mt-1">
              <span>VAT</span>
              <span>{formatCurrency(dynamicVat, exchangeRate, currency)}</span>
            </div>
          </div>
          <div className="border-t border-gray-200 pt-1">
            <div className="font-bold text-xs text-gray-500">RATE DETAILS</div>
            <div className="flex justify-between text-sm mt-1">
              <span>Price</span>
              <span>{formatCurrency(dynamicPrice, exchangeRate, currency)}</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SelectedServiceCard;
