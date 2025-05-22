import React, { useEffect } from "react";
import { Outlet } from "react-router-dom";
import { SelectedRoomsProvider } from "./contexts/SelectedRoomsContext";
import { SelectedDateProvider } from "./contexts/SelectedDateContext";
import { CurrencyProvider } from "./contexts/CurrencyProvider";
import { SelectedServicesProvider } from "./contexts/SelectedServicesContext"; // ✅ Add this

function App() {
  useEffect(() => {
    const setAppHeight = () => {
      document.documentElement.style.setProperty('--app-height', `${window.innerHeight}px`);
    };
    setAppHeight();
    window.addEventListener('resize', setAppHeight);
    return () => window.removeEventListener('resize', setAppHeight);
  }, []);
  return (
    <CurrencyProvider>
      <SelectedDateProvider>
        <SelectedRoomsProvider>
          <SelectedServicesProvider> {/* ✅ Wrap here */}
            <div className="font-sans bg-gray-50 min-h-screen">
              <Outlet />
            </div>
          </SelectedServicesProvider>
        </SelectedRoomsProvider>
      </SelectedDateProvider>
    </CurrencyProvider>
  );
}

export default App;