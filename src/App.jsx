import React from "react";
import { Outlet } from "react-router-dom";
import { SelectedRoomsProvider } from "./contexts/SelectedRoomsContext";
import { SelectedDateProvider } from "./contexts/SelectedDateContext";
import { CurrencyProvider } from "./contexts/CurrencyProvider";
import { SelectedServicesProvider } from "./contexts/SelectedServicesContext"; // ✅ Add this

function App() {
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