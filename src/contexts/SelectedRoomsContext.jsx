// src/context/SelectedRoomsContext.js

import React, { createContext, useContext, useEffect, useState } from "react";

const SelectedRoomsContext = createContext();

export const SelectedRoomsProvider = ({ children }) => {
  const [selectedRooms, setSelectedRooms] = useState(() => {
    const stored = localStorage.getItem("selectedRooms");
    return stored ? JSON.parse(stored) : [];
  });

  // Save to localStorage whenever selectedRooms changes
  useEffect(() => {
    localStorage.setItem('selectedRooms', JSON.stringify(selectedRooms));
  }, [selectedRooms]);

  const addRoom = (room) => {
    const instanceId = `${room._id || room.id || 'room'}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
    const requiresBedChoice = Array.isArray(room.bedTypes) && room.bedTypes.length > 1;
    setSelectedRooms(prev => [...prev, { ...room, instanceId, requiresBedChoice }]);
  };

  const removeRoom = (roomId) => {
    setSelectedRooms(prev => {
      const filtered = prev.filter(r => {
        return r.instanceId?.toString() !== roomId?.toString();
      });
      console.log("🧹 Remaining rooms after filter:", filtered.map(r => r.instanceId || r._id));
      return filtered;
    });
  };

  const clearRooms = () => {
    setSelectedRooms([]);
  };

  const updateRoomsAfterRateRefresh = (updatedRooms) => {
    setSelectedRooms(updatedRooms);
  };

  const refreshSelectedRooms = async (stayPeriod, breakfastIncluded) => {
    const refreshed = await Promise.all(selectedRooms.map(async (room) => {
      try {
        const params = new URLSearchParams({
          propertyId: room.propertyId,
          roomType: room.roomType,
          startDate: stayPeriod.startDate,
          endDate: stayPeriod.endDate,
          breakfast: breakfastIncluded ? "true" : "false",
        });
        const response = await fetch(`/api/rates/search?${params.toString()}`);
        const rateData = await response.json();

        return {
          ...room,
          price: rateData.totalPrice ?? room.price,
          perNight: rateData.perNight ?? room.perNight,
          vat: (rateData.totalPrice ?? room.price) * 0.1,
          unavailable: false,
        };
      } catch (error) {
        console.error("Rate refresh failed for room:", room.roomType);
        return { ...room, unavailable: true };
      }
    }));

    setSelectedRooms(refreshed);
  };

  const updateRoomBedType = (roomId, bedType) => {
    setSelectedRooms(prev =>
      prev.map(room =>
        room.id === roomId || room.roomId === roomId
          ? { ...room, bedType }
          : room
      )
    );
  };

  // Fetches room detail from backend by room ID
  const getRoomDetail = async (roomId, propertyId) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/rooms/${roomId}?propertyId=${propertyId}`);
      const data = await res.json();
      return data;
    } catch (err) {
      console.error("Failed to fetch room by ID:", err);
      return null;
    }
  };

  return (
    <SelectedRoomsContext.Provider
      value={{
        selectedRooms,
        setSelectedRooms,
        addRoom,
        removeRoom,
        clearRooms,
        updateRoomsAfterRateRefresh,
        refreshSelectedRooms,
        updateRoomBedType,
        getRoomDetail,
      }}
    >
      {children}
    </SelectedRoomsContext.Provider>
  );
};

export const useSelectedRooms = () => useContext(SelectedRoomsContext);