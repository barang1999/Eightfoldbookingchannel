import React, { useEffect } from "react";
import { Outlet } from "react-router-dom";
import { SelectedRoomsProvider } from "./contexts/SelectedRoomsContext";
import { SelectedDateProvider } from "./contexts/SelectedDateContext";
import { CurrencyProvider } from "./contexts/CurrencyProvider";
import { SelectedServicesProvider } from "./contexts/SelectedServicesContext"; // ✅ Add this
import { PropertyProvider } from "./contexts/PropertyContext";
import { Analytics } from '@vercel/analytics/react';
import { usePageTracking } from './hooks/usePageTracking';

function App() {
  usePageTracking();
  useEffect(() => {
    const setAppHeight = () => {
      document.documentElement.style.setProperty('--app-height', `${window.innerHeight}px`);
    };
    setAppHeight();
    window.addEventListener('resize', setAppHeight);
    return () => window.removeEventListener('resize', setAppHeight);
  }, []);
  return (
    <PropertyProvider>
      <CurrencyProvider>
        <SelectedDateProvider>
          <SelectedRoomsProvider>
            <SelectedServicesProvider> {/* ✅ Wrap here */}
              <div className="font-sans bg-gray-50 min-h-screen">
                <Outlet />
              </div>
              <Analytics />
            </SelectedServicesProvider>
          </SelectedRoomsProvider>
        </SelectedDateProvider>
      </CurrencyProvider>
    </PropertyProvider>
  );
}

export default App;