import React, { useState, useRef } from "react";
import { useClickOutside } from "../hooks/useClickOutside";
import { useCurrency } from "../contexts/CurrencyProvider";

const regions = {
  "Asia - Pacific": [
    "AUD", "MMK", "KHR", "CNY", "FJD", "GEL", "HKD", "INR", "IDR",
    "JPY", "KZT", "LAK", "MOP", "MYR", "NZD", "PHP", "SGD", "KRW",
    "TWD", "THB", "USD", "VND"
  ],
  Europe: [
    "GBP", "BGN", "CZK", "DKK", "EUR", "HUF", "MKD", "NOK", "PLN",
    "RON", "RUB", "SEK", "CHF", "TRY", "UAH"
  ],
  "Americas": [
    "USD", "CAD", "BRL", "ARS", "MXN", "CLP", "COP", "CUP", "DOP",
    "GTQ", "PAB", "PYG", "PEN", "UYU"
  ],
  "Middle East": [
    "AED", "ILS", "JOD", "KWD", "BHD", "LBP"
  ],
  Africa: [
    "DZD", "AOA", "XAF", "XOF", "EGP", "GHS", "MAD", "MGA"
  ],
};

const currencyNames = {
  KHR: "Cambodian Riel",
  THB: "Thai Baht",
  VND: "Vietnamese Dong",
  MYR: "Malaysian Ringgit",
  IDR: "Indonesian Rupiah",
  SGD: "Singapore Dollar",
  AUD: "Australian Dollar",
  JPY: "Japanese Yen",
  CNY: "Chinese Yuan",
  KRW: "South Korean Won",
  EUR: "Euro",
  GBP: "Pound Sterling",
  CHF: "Swiss Franc",
  SEK: "Swedish Krona",
  NOK: "Norwegian Krone",
  CZK: "Czech Koruna",
  PLN: "Polish Zloty",
  HUF: "Hungarian Forint",
  USD: "US Dollar",
  CAD: "Canadian Dollar",
  BRL: "Brazilian Real",
  ARS: "Argentine Peso",
  MXN: "Mexican Peso",
  CLP: "Chilean Peso",
  COP: "Colombian Peso",
  CUP: "Cuban Peso",
  DOP: "Dominican Peso",
  GTQ: "Guatemalan Quetzal",
  PAB: "Panamanian Balboa",
  PYG: "Paraguayan Guarani",
  PEN: "Peruvian Nuevo Sol",
  UYU: "Uruguayan Peso",
  AED: "UAE Dirham",
  SAR: "Saudi Riyal",
  OMR: "Omani Rial",
  ILS: "Israeli Shekel",
  JOD: "Jordanian Dinar",
  ZAR: "South African Rand",
  DZD: "Algerian Dinar",
  MAD: "Moroccan Dirham",
  MMK: "Burmese Kyat",
  FJD: "Fijian Dollar",
  GEL: "Georgian Lari",
  HKD: "Hong Kong Dollar",
  INR: "Indian Rupee",
  KZT: "Kazakhstani Tenge",
  LAK: "Lao Or Laotian Kip",
  MOP: "Macau Pataca",
  NZD: "New Zealand Dollar",
  PHP: "Philippine Peso",
  TWD: "Taiwan New Dollar",
  BGN: "Bulgarian Lev",
  DKK: "Danish Krone",
  MKD: "Macedonian Denar",
  RON: "Romanian New Leu",
  RUB: "Russian Ruble",
  TRY: "Turkish Lira",
  UAH: "Ukrainian Hryvnia",
  BHD: "Bahraini Dinar",
  KWD: "Kuwaiti Dinar",
  LBP: "Lebanese Pound",
  AOA: "Angolan Kwanza",
  XAF: "Central African CFA Franc BEAC",
  XOF: "CFA Franc",
  EGP: "Egyptian Pound",
  GHS: "Ghanaian Cedi",
  MGA: "Malagasy Ariary",
};

const CurrencySelectorModal = ({ isOpen, onClose }) => {
  const { setCurrency } = useCurrency();
  const [region, setRegion] = useState("Asia - Pacific");
  const [selectedCurrency, setSelectedCurrency] = useState("KHR");
  const modalRef = useRef();
  useClickOutside(modalRef, onClose);

  const handleConfirm = () => {
    setCurrency(selectedCurrency);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center">
      <div
        ref={modalRef}
        className="bg-white px-6 py-8 rounded-xl w-[90%] max-w-md shadow-2xl border border-gray-200"
      >
        <h2 className="text-2xl font-sm font-light mb-6 text-center text-gray-800">Select your currency</h2>

        <label className="block mb-1 font-normal text-gray-700">Geographical area</label>
        <select
          className="w-full border border-gray-300 rounded-lg px-3 py-2 mb-5 text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#a18c5f]"
          value={region}
          onChange={(e) => {
            const newRegion = e.target.value;
            setRegion(newRegion);
            const firstCurrency = regions[newRegion]?.[0];
            if (firstCurrency) setSelectedCurrency(firstCurrency);
          }}
        >
          {Object.keys(regions).map((regionKey) => (
            <option key={regionKey} value={regionKey}>
              {regionKey}
            </option>
          ))}
        </select>

        <label className="block mb-1 font-normal text-gray-700">Currency</label>
        <select
          className="w-full border border-gray-300 rounded-lg px-3 py-2 mb-5 text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#a18c5f]"
          value={selectedCurrency}
          onChange={(e) => setSelectedCurrency(e.target.value)}
        >
          {regions[region].map((cur) => (
            <option key={cur} value={cur}>
              {cur} - {currencyNames[cur]}
            </option>
          ))}
        </select>

        <button
          onClick={handleConfirm}
          className="w-full bg-[#a18c5f] hover:bg-[#8b784f] transition text-white py-2.5 rounded-lg font-medium text-lg"
        >
          Confirm my currency
        </button>
      </div>
    </div>
  );
};

export default CurrencySelectorModal;