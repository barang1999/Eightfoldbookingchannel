// src/context/CurrencyProvider.jsx
import React, { createContext, useContext, useEffect, useState } from "react";

// Helper to get currency symbol from code
const getCurrencySymbol = (code) => {
  try {
    return (0).toLocaleString("en", {
      style: "currency",
      currency: code,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).replace(/\d/g, "").trim();
  } catch {
    return code;
  }
};

const CurrencyContext = createContext();

export const CurrencyProvider = ({ children }) => {
  const defaultCurrency = "USD";
  const [currency, setCurrency] = useState(defaultCurrency);
  const [exchangeRate, setExchangeRate] = useState(1);
  const currencySign = getCurrencySymbol(currency);

  // Load from localStorage on first render
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("currencyData"));
    if (saved && saved.currency && saved.exchangeRate) {
      setCurrency(saved.currency);
      setExchangeRate(saved.exchangeRate);
    }
  }, []);

  // Save to localStorage when updated
  useEffect(() => {
    localStorage.setItem(
      "currencyData",
      JSON.stringify({ currency, exchangeRate })
    );
  }, [currency, exchangeRate]);

  const ONE_HOUR = 60 * 60 * 1000;

  // Fetch rate when currency changes
  useEffect(() => {
    const fetchRate = async () => {
      if (currency === "USD") {
        setExchangeRate(1);
        return;
      }

      // Check if cached and still fresh
      const cached = JSON.parse(localStorage.getItem("currencyData"));
      const now = new Date().getTime();
      if (
        cached &&
        cached.currency === currency &&
        cached.exchangeRate &&
        cached.timestamp &&
        now - cached.timestamp < ONE_HOUR
      ) {
        setExchangeRate(cached.exchangeRate);
        console.log(`💾 Using cached rate: 1 USD = ${cached.exchangeRate} ${currency}`);
        return;
      }

      try {
        const res = await fetch(`https://open.er-api.com/v6/latest/USD?cachebuster=${Date.now()}`);
        const data = await res.json();

        if (!data || !data.rates) {
          console.error("❌ Invalid API response structure:", data);
          setExchangeRate(1);
          return;
        }

        const rate = data.rates[currency];
        if (typeof rate === "number" && rate > 0) {
          setExchangeRate(rate);
          localStorage.setItem(
            "currencyData",
            JSON.stringify({ currency, exchangeRate: rate, timestamp: now })
          );
          console.log(`✅ Live exchange rate fetched: 1 USD = ${rate} ${currency}`);
        } else {
          console.warn(`⚠️ No valid exchange rate found for ${currency}. Defaulting to 1.`);
          setExchangeRate(1);
        }
      } catch (err) {
        console.error("❌ Failed to fetch exchange rate:", err);
      }
    };

    fetchRate();
  }, [currency]);

  return (
    <CurrencyContext.Provider value={{ currency, currencyCode: currency, exchangeRate, setCurrency, currencySign }}>
      {children}
    </CurrencyContext.Provider>
  );
};

function useCurrency() {
  return useContext(CurrencyContext);
}
export { useCurrency };